// controllers/taskController.js
const { sql, getConnection } = require('../config/dbConfig');

// 1) Yeni görev oluşturma
exports.createTask = async (req, res) => {
    try {
        const { baslik, aciklama, departman_id, assigned_by, due_date } = req.body;

        const pool = await getConnection();
        const result = await pool.request()
            .input('baslik', sql.VarChar(255), baslik)
            .input('aciklama', sql.VarChar(sql.MAX), aciklama)
            .input('departman_id', sql.Int, departman_id)
            .input('assigned_by', sql.Int, assigned_by)
            .input('due_date', sql.DateTime, due_date || null)
            .query(`
        INSERT INTO [dbo].[tasks]
          ([baslik],[aciklama],[departman_id],[assigned_by],[due_date],[status])
        OUTPUT inserted.id
        VALUES (@baslik, @aciklama, @departman_id, @assigned_by, @due_date, 'open')
      `);

        const insertedId = result.recordset[0].id;
        return res.status(201).json({
            success: true,
            message: 'Görev oluşturuldu',
            taskId: insertedId
        });
    } catch (error) {
        console.error('createTask error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 2) Görevi tamamla -> awaiting_approval
exports.completeTask = async (req, res) => {
    try {
        const { taskId, completedBy, completionNote } = req.body;

        const pool = await getConnection();
        await pool.request()
            .input('taskId', sql.Int, taskId)
            .input('completedBy', sql.Int, completedBy)
            .input('completionNote', sql.VarChar(sql.MAX), completionNote)
            .query(`
              UPDATE [dbo].[tasks]
              SET 
                [status] = 'awaiting_approval',
                [completed_by] = @completedBy,
                [completed_date] = GETDATE(),
                [completion_note] = @completionNote
              WHERE [id] = @taskId
            `);

        return res.json({
            success: true,
            message: 'Görev onay bekleme durumuna alındı (awaiting_approval)'
        });
    } catch (error) {
        console.error('completeTask error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};


// 3) Admin onaylama
exports.approveTask = async (req, res) => {
    try {
        const { taskId, approvedBy } = req.body;

        const pool = await getConnection();
        await pool.request()
            .input('taskId', sql.Int, taskId)
            .input('approvedBy', sql.Int, approvedBy)
            .query(`
        UPDATE [dbo].[tasks]
        SET
          [status] = 'approved',
          [approved_by] = @approvedBy,
          [approval_date] = GETDATE()
        WHERE [id] = @taskId
      `);

        return res.json({
            success: true,
            message: 'Görev onaylandı'
        });
    } catch (error) {
        console.error('approveTask error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 4) Admin reddetme
exports.rejectTask = async (req, res) => {
    try {
        const { taskId, rejectedBy, rejectionReason, newDueDate } = req.body;

        const pool = await getConnection();
        await pool.request()
            .input('taskId', sql.Int, taskId)
            .input('rejectedBy', sql.Int, rejectedBy)
            .input('rejectionReason', sql.VarChar(sql.MAX), rejectionReason)
            .input('newDueDate', sql.DateTime, newDueDate || null)
            .query(`
        UPDATE [dbo].[tasks]
        SET
          [status] = 'rejected',
          [rejected_by] = @rejectedBy,
          [rejection_date] = GETDATE(),
          [rejection_reason] = @rejectionReason,
          [new_due_date] = @newDueDate
        WHERE [id] = @taskId
      `);

        return res.json({
            success: true,
            message: 'Görev reddedildi'
        });
    } catch (error) {
        console.error('rejectTask error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};
// taskController.js içine ekle
exports.listPendingTasks = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query(`
        SELECT * 
        FROM [dbo].[tasks]
        WHERE [status] = 'awaiting_approval'
        ORDER BY [created_at] DESC
      `);

        return res.json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('listPendingTasks error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 5) Not ekleme
exports.addNote = async (req, res) => {
    try {
        // /:taskId/notes -> param
        const { taskId } = req.params;
        const { userId, note } = req.body;

        // taskId'yi parse et (ihtiyaç varsa)
        const parsedTaskId = parseInt(taskId, 10);
        if (isNaN(parsedTaskId)) {
            return res.status(400).json({ success: false, message: 'Geçersiz taskId' });
        }

        const pool = await getConnection();
        await pool.request()
            .input('taskId', sql.Int, parsedTaskId)
            .input('userId', sql.Int, userId)
            .input('note', sql.VarChar(sql.MAX), note)
            .query(`
        INSERT INTO [dbo].[task_notes] ([task_id],[user_id],[note])
        VALUES (@taskId, @userId, @note)
      `);

        return res.json({
            success: true,
            message: 'Not eklendi'
        });
    } catch (error) {
        console.error('addNote error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};

// 6) Tüm görevleri listele

exports.listTasks = async (req, res) => {
    try {
        const pool = await getConnection();

        const userDepartmentId = req.user.departmentId;
        const isSuperUser = req.user.isSuperUser;
        const { status } = req.query;

        let query = `
        SELECT 
            t.id,
            t.baslik,
            t.aciklama,
            t.status,
            t.assigned_by,
            t.departman_id,
            d.departman_adi,
            t.created_at,
            t.due_date,
            t.rejection_reason
        FROM dbo.tasks t
        LEFT JOIN dbo.departman d ON t.departman_id = d.departman_id
        `;

        // Eğer admin değilse, sadece kendi departmanına ait görevleri getir
        if (!isSuperUser) {
            query += ` WHERE t.departman_id = @departmentId `;
        }

        // Eğer status sorgu parametresi varsa duruma göre filtre uygula
        if (status) {
            const statuses = status.split(',').map((s) => `'${s.trim()}'`).join(',');
            query += isSuperUser
                ? ` WHERE t.status IN (${statuses}) `
                : ` AND t.status IN (${statuses}) `;
        }

        // Görevleri bitirme tarihine göre sıralayalım
        query += ' ORDER BY t.due_date ASC ';

        const request = pool.request();
        if (!isSuperUser) {
            request.input('departmentId', sql.Int, userDepartmentId);
        }

        const result = await request.query(query);

        return res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error('listTasks error:', error.message);
        return res.status(500).json({ success: false, message: 'Sunucu hatası.' });
    }
};

// 7) Tekil görev detayı
exports.getTaskById = async (req, res) => {
    try {
        const { id } = req.params;

        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz ID, sayı olmalı'
            });
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, parsedId)
            .query(`
        SELECT *
        FROM [dbo].[tasks]
        WHERE [id] = @id
      `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'Görev bulunamadı' });
        }

        return res.json({ success: true, data: result.recordset[0] });
    } catch (error) {
        console.error('getTaskById error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};
