import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const Sidebar = () => {
  const { user } = useAuth();
  const [dropdowns, setDropdowns] = useState({
    personnel: false,
    department: false,
    user: false,
    task: false,
    announcement: false,
    shift: false,
    additional: false,
    assistant: false,
  });

  const toggleDropdown = (key) => {
    setDropdowns((prevState) =>
      Object.keys(prevState).reduce((acc, curr) => {
        acc[curr] = curr === key ? !prevState[curr] : false;
        return acc;
      }, {})
    );
  };

  const DropdownItem = ({ title, keyName, links }) => (
    <li
      className="nav-item"
      style={{ borderBottom: "1px solid #2b2f36", paddingBottom: "5px" }}
    >
      <div
        className="nav-link d-flex justify-content-between align-items-center"
        style={{
          padding: "10px 20px",
          cursor: "pointer",
          color: "#b0b3b8",
          fontWeight: "500",
        }}
        onClick={() => toggleDropdown(keyName)}
      >
        {title}
        {dropdowns[keyName] ? <FaChevronUp /> : <FaChevronDown />}
      </div>
      {dropdowns[keyName] && (
        <ul className="nav flex-column ps-3">
          {links.map(({ path, label }) => (
            <li className="nav-item" key={path}>
              <NavLink
                to={path}
                className="nav-link"
                style={{ padding: "8px 20px", color: "#b0b3b8" }}
                activeStyle={{
                  color: "#fff",
                  backgroundColor: "#273043",
                  borderRadius: "5px",
                }}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );

  return (
    <div
      style={{
        backgroundColor: "#1b1e24",
        color: "#fff",
        width: "240px",
        height: "100vh",
        overflowY: "auto",
        padding: "10px 0",
      }}
    >
      <div style={{ padding: "20px", fontSize: "20px", fontWeight: "bold" }}>
        Personnel Management and Control Panel
      </div>
      <ul className="nav flex-column" style={{ marginTop: "10px" }}>
        <li
          className="nav-item"
          style={{ borderBottom: "1px solid #2b2f36", paddingBottom: "5px" }}
        >
          <NavLink
            to="/dashboard"
            className="nav-link"
            style={{
              padding: "10px 20px",
              color: "#b0b3b8",
              fontWeight: "500",
              display: "block",
            }}
            activeStyle={{
              color: "#fff",
              backgroundColor: "#273043",
              borderRadius: "5px",
            }}
          >
            Dashboard
          </NavLink>
        </li>

        <DropdownItem
          title="Announcement"
          keyName="announcement"
          links={[
            { path: "/announcement/list", label: "Announcement List" },
            { path: "/announcement/create", label: "Create Announcement" },
          ]}
        />

        {user?.isSuperUser && (
          <DropdownItem
            title="User Management"
            keyName="user"
            links={[
              { path: "/users/list", label: "List User" },
              { path: "/users/add", label: "Add User" },
              { path: "/users/update", label: "Update User" },
              { path: "/users/delete", label: "Delete User" },
            ]}
          />
        )}

        {user?.isSuperUser && (
          <DropdownItem
            title="Department Management"
            keyName="department"
            links={[
              { path: "/departments/add", label: "Add Department" },
              { path: "/departments/delete", label: "Delete Department" },
            ]}
          />
        )}

        <DropdownItem
          title="Personnel Management"
          keyName="personnel"
          links={[
            { path: `/personnel/list/${user?.department?.id || ""}`, label: "List Personnel" },
            { path: `/personnel/add/${user?.department?.id || ""}`, label: "Add Personnel" },
            { path: `/personnel/update/${user?.department?.id || ""}`, label: "Update Personnel" },
            { path: `/personnel/delete/${user?.department?.id || ""}`, label: "Delete Personnel" },
          ]}
        />

        <DropdownItem
          title="Task Management"
          keyName="task"
          links={[
            { path: "/tasks/list", label: "Task List" },
            { path: "/tasks/approved", label: "Completed Tasks" },
            ...(user?.isSuperUser
              ? [
                  { path: "/tasks/pending", label: "Pending Tasks" },
                  { path: "/tasks/create", label: "Add Task" },
                ]
              : []),
          ]}
        />

        <DropdownItem
          title="Shift Management"
          keyName="shift"
          links={[
            { path: "/shift/list", label: "Shift List" },
            ...(user?.isSuperUser
              ? [{ path: "/shift/create", label: "Create Shift" }]
              : []),
            { path: "/shift/assignPersonnel", label: "Assign Shift" },
            { path: "/shift/delete", label: "Delete Shift" },
            { path: "/shift/removePersonnel", label: "Remove from Shift" },
            { path: "/shift/update", label: "Update Shift" },
          ]}
        />

        <DropdownItem
          title="Additional Operations"
          keyName="additional"
          links={[
            { path: "/additional/extraShift", label: "Add Overtime" },
            { path: "/additional/absenteeism", label: "Add Absenteeism" },
            { path: "/additional/addHoliday", label: "Add Holiday" },
          ]}
        />

        <DropdownItem
          title="AI ASSISTANT"
          keyName="assistant"
          links={[
            { path: "/assistant/query", label: "Get Query" },
            
          ]}
        />
      </ul>
    </div>
  );
};

export default Sidebar;
