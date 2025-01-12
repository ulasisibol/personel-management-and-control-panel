const { sql, getConnection } = require('../config/dbConfig');


exports.createShift = async (req, res) => {
    try {
        const { title, department_id, start_time, end_time } = req.body;

        // TIME format kontrolü
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/; // HH:mm formatı
        if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
            return res.status(400).json({
                success: false,
                message: "Geçersiz saat formatı. Lütfen HH:mm formatında gönderin.",
            });
        }

        // Veritabanına ekleme
        const pool = await getConnection();
        await pool.request()
            .input("title", sql.NVarChar, title)
            .input("department_id", sql.Int, department_id)
            .input("start_time", sql.VarChar, start_time) // TIME olarak SQL'e uygun
            .input("end_time", sql.VarChar, end_time)    // TIME olarak SQL'e uygun
            .query(`
          INSERT INTO shifts (title, department_id, start_time, end_time)
          VALUES (@title, @department_id, @start_time, @end_time)
        `);

        res.status(201).json({ success: true, message: "Vardiya başarıyla oluşturuldu." });
    } catch (error) {
        console.error("createShift error:", error.message);
        res.status(500).json({ success: false, message: "Sunucu hatası." });
    }
};



exports.getShifts = async (req, res) => {
    try {
        const { isSuperUser, departmentId } = req.user; // Kullanıcı bilgilerini alın

        const pool = await getConnection();

        // Shift ve Department bilgilerini birleştiren sorgu
        let query = `
        SELECT 
          shifts.id, 
          shifts.title, 
          shifts.start_time, 
          shifts.end_time, 
          shifts.department_id,
          departman.departman_adi AS department_name
        FROM shifts
        LEFT JOIN departman ON shifts.department_id = departman.departman_id
      `;

        // Eğer admin değilse, sadece kendi departmanına ait shiftleri döndür
        if (!isSuperUser) {
            query += ` WHERE shifts.department_id = @departmentId`;
        }

        const request = pool.request();
        if (!isSuperUser) {
            request.input("departmentId", sql.Int, departmentId);
        }

        const result = await request.query(query);

        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error("Error fetching shifts:", error.message);
        res.status(500).json({ success: false, message: "Error fetching shifts." });
    }
};



// GET /api/personnel
exports.getPersonnel = async (req, res) => {
    try {
        const isSuperUser = req.user.isSuperUser;
        const departmentId = req.user.departmentId;

        let query = `
            SELECT id, first_name, last_name, department_id
            FROM [dbo].[personnel]
        `;

        if (!isSuperUser) {
            query += ` WHERE department_id = @department_id`;
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input("department_id", sql.Int, departmentId)
            .query(query);

        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error("getPersonnel error:", error.message);
        res.status(500).json({ success: false, message: "Personel listesi alınamadı." });
    }
};

exports.assignPersonnelToShift = async (req, res) => {
    const { personnelIds, assignedDate } = req.body;
    const shiftId = req.params.shiftId; // shiftId'yi req.params üzerinden alın

    console.log("Shift ID (param):", shiftId); // Gelen shiftId'yi kontrol edin
    console.log("Request Body:", req.body); // Gelen body'yi kontrol edin

    if (!Array.isArray(personnelIds) || personnelIds.length === 0) {
        return res.status(400).json({ message: "personnelIds must be a non-empty array" });
    }

    if (!shiftId) {
        return res.status(400).json({ message: "shiftId is required" });
    }

    if (!assignedDate) {
        return res.status(400).json({ message: "assignedDate is required" });
    }

    const query = `
        INSERT INTO PersonelShift (PersonnelId, ShiftId, AssignedDate)
        VALUES (@personnelId, @shiftId, @assignedDate)
    `;

    try {
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        for (const personnelId of personnelIds) {
            await transaction.request()
                .input("personnelId", sql.Int, personnelId)
                .input("shiftId", sql.Int, shiftId)
                .input("assignedDate", sql.Date, assignedDate)
                .query(query);
        }

        await transaction.commit();
        res.status(200).json({ message: "Personnel assigned to shift successfully" });
    } catch (error) {
        console.error("Error assigning personnel to shift:", error);
        res.status(500).json({ message: "An error occurred while assigning personnel to shift", error: error.message });
    }
};



exports.getAssignedShifts = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        const isSuperUser = req.user.isSuperUser;
        const departmentId = req.user.departmentId;
        const shiftId = req.query.shiftId; // Shift ID'yi sorgudan alıyoruz

        let query = `
            SELECT 
                ps.Id AS assignment_id, 
                ps.PersonnelId AS personnel_id, 
                ps.ShiftId AS shift_id, 
                ps.AssignedDate AS assigned_date, 
                s.start_time, 
                s.end_time, 
                s.title AS shift_title,
                p.first_name, 
                p.last_name
            FROM 
                [dbo].[PersonelShift] ps
            INNER JOIN 
                [dbo].[shifts] s ON ps.ShiftId = s.id
            INNER JOIN 
                [dbo].[personnel] p ON ps.PersonnelId = p.personnel_id
        `;

        const conditions = [];
        if (shiftId) conditions.push("ps.ShiftId = @shiftId");
        if (!isSuperUser) conditions.push("s.department_id = @department_id");

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(" AND ")}`;
        }

        const pool = await getConnection();
        const request = pool.request();

        if (shiftId) {
            request.input("shiftId", sql.Int, shiftId);
        }
        if (!isSuperUser) {
            request.input("department_id", sql.Int, departmentId);
        }

        const result = await request.query(query);

        res.status(200).json({ success: true, data: result.recordset });
    } catch (error) {
        console.error("getAssignedShifts error:", error.message);
        res.status(500).json({ success: false, message: "Atanmış vardiyalar alınamadı." });
    }
};



exports.getAvailablePersonnel = async (req, res) => {
    const { shiftId } = req.query;

    if (!shiftId) {
        return res.status(400).json({ message: "shiftId is required" });
    }

    try {
        const pool = await getConnection();
        const query = `
            SELECT p.personnel_id, p.first_name, p.last_name, p.department_id
            FROM personnel p
            WHERE p.department_id = (
                SELECT s.department_id
                FROM shifts s
                WHERE s.id = @shiftId
            )
              AND p.personnel_id NOT IN (
                  SELECT DISTINCT ps.PersonnelId
                  FROM PersonelShift ps
                  WHERE ps.ShiftId = @shiftId
              )
        `;

        const request = pool.request().input('shiftId', sql.Int, shiftId);

        const result = await request.query(query);

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Error fetching available personnel:", error);
        res.status(500).json({ message: "Error fetching available personnel", error: error.message });
    }
};




exports.deleteShift = async (req, res) => {
    const { shiftId } = req.params;

    if (!shiftId) {
        return res.status(400).json({ message: "Shift ID is required" });
    }

    try {
        const pool = await getConnection();
        const query = `
            DELETE FROM shifts
            WHERE id = @shiftId
        `;

        const request = pool.request().input("shiftId", sql.Int, shiftId);

        await request.query(query);

        res.status(200).json({ success: true, message: "Shift deleted successfully" });
    } catch (error) {
        console.error("Error deleting shift:", error);
        res.status(500).json({ success: false, message: "Error deleting shift", error: error.message });
    }
};


exports.removePersonnelFromShift = async (req, res) => {
    const { personnelIds } = req.body;
    const shiftId = req.params.shiftId; // shiftId'yi req.params üzerinden alın

    if (!Array.isArray(personnelIds) || personnelIds.length === 0) {
        return res.status(400).json({ message: "personnelIds must be a non-empty array" });
    }

    if (!shiftId) {
        return res.status(400).json({ message: "shiftId is required" });
    }

    try {
        const pool = await getConnection();
        const transaction = new sql.Transaction(pool);

        await transaction.begin();

        for (const personnelId of personnelIds) {
            const result = await transaction.request()
                .input("personnelId", sql.Int, personnelId)
                .input("shiftId", sql.Int, shiftId)
                .query(`
                    DELETE FROM PersonelShift
                    WHERE PersonnelId = @personnelId AND ShiftId = @shiftId
                `);

            // Satır silinip silinmediğini kontrol edin
            if (result.rowsAffected[0] === 0) {
                console.log(`No row deleted for PersonnelId: ${personnelId}, ShiftId: ${shiftId}`);
            } else {
                console.log(`Row deleted for PersonnelId: ${personnelId}, ShiftId: ${shiftId}`);
            }
        }

        await transaction.commit();

        res.status(200).json({ message: "Personnel removed from shift successfully" });
    } catch (error) {
        console.error("Error removing personnel from shift:", error);
        res.status(500).json({ message: "An error occurred while removing personnel from shift", error: error.message });
    }
};


exports.updateShift = async (req, res) => {
    const { shiftId } = req.params;
    const { title, department_id, start_time, end_time } = req.body;

    // Validasyon
    if (!shiftId) {
        return res.status(400).json({ message: "Shift ID is required" });
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/; // HH:mm formatı
    if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
        return res.status(400).json({
            success: false,
            message: "Geçersiz saat formatı. Lütfen HH:mm formatında gönderin.",
        });
    }

    try {
        const pool = await getConnection();
        const query = `
            UPDATE shifts
            SET 
                title = @title,
                department_id = @department_id,
                start_time = @start_time,
                end_time = @end_time
            WHERE id = @shiftId
        `;

        const request = pool.request()
            .input("shiftId", sql.Int, shiftId)
            .input("title", sql.NVarChar, title)
            .input("department_id", sql.Int, department_id)
            .input("start_time", sql.VarChar, start_time) // SQL TIME formatına uygun
            .input("end_time", sql.VarChar, end_time);   // SQL TIME formatına uygun

        const result = await request.query(query);

        // Güncellenen satır sayısını kontrol et
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Shift not found or no changes applied." });
        }

        res.status(200).json({ success: true, message: "Shift updated successfully." });
    } catch (error) {
        console.error("updateShift error:", error.message);
        res.status(500).json({ success: false, message: "Error updating shift.", error: error.message });
    }
};
