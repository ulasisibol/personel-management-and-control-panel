import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/useAuth.js";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import axios from "axios";
import styled from 'styled-components';


const SidebarContainer = styled.div`
  background-color: #111;
  color: #fff;
  width: 240px;
  height: 100vh;
  overflow-y: auto;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
`;

const MenuItem = styled.div`
  padding: 10px 20px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 3px solid transparent;
  &:hover {
    background-color: #333;
    border-left: 3px solid #fff;
  }
`;

const StyledLink = styled(NavLink)`
  color: #b0b3b8;
  text-decoration: none;
  &:hover {
    color: #fff;
  }
`;

const DropdownContent = styled.div`
  display: ${props => props.isOpen ? 'block' : 'none'};
  background: #222;
  padding-left: 20px;
`;

const Icon = styled.span`
  color: #b0b3b8;
`;


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
    queries: false,
  });
  const [savedQueries, setSavedQueries] = useState([]);

  const toggleDropdown = (key) => {
    setDropdowns((prevState) =>
      Object.keys(prevState).reduce((acc, curr) => {
        acc[curr] = curr === key ? !prevState[curr] : false;
        return acc;
      }, {})
    );
  };


// Saved Queries'i API'den çek
useEffect(() => {
  console.log("User Info:", user);

  const fetchQueries = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/openai/list", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Gelen verileri kontrol et ve kaydet
      if (response.data) {
        setSavedQueries(response.data);
      }
    } catch (error) {
      console.error("Error fetching saved queries:", error.message);
    }
  };

  fetchQueries();
}, []);


const DropdownItem = ({ title, keyName, links }) => (
  <li
    className="nav-item"
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
        {links.map(({ path, label, state }) => (
          <li className="nav-item" key={path}>
            <NavLink
              to={{ pathname: path, state }} // State özelliğini doğru gönderin
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
        backgroundColor: "#000",
        color: "#fff",
        minWidth: "300px",
        maxWidth: "300px",
        height: "100vh",
        overflowY: "auto",
        padding: "10px 0",
      }}
    >
      <div style={{  fontSize: "20px", fontWeight: "" }}>
        x
      </div>
      <ul className="nav flex-column" style={{ marginTop: "40px" }}>
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
              ? [ { path: "/shift/update", label: "Update Shift" },{ path: "/shift/create", label: "Create Shift" }]
              : []),
            { path: "/shift/assignPersonnel", label: "Assign Shift" },
            
            { path: "/shift/removePersonnel", label: "Remove from Shift" },
           
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
{user?.isSuperUser && (
        <DropdownItem
          title="AI ASSISTANT"
          keyName="assistant"
          links={[
            { path: "/assistant/query", label: "Get Query" },
            { path: "/assistant/query/delete", label: "Delete Query" },
            
          ]}
        />
      )}
<DropdownItem
  title="Saved Queries"
  keyName="queries"
  links={
    savedQueries
      .filter((query) =>
        user?.isSuperUser // Eğer adminse tüm sorguları gör
          ? true
          : query.department_id === user.departmentId || query.is_public === 1 // Diğer kullanıcılar için departmanına ait veya herkese açık olanlar
      )
      .map((query) => ({
        path: `/assistant/query/${query.id}`, // Yönlendirme için path
        state: { query: query.query }, // Query detayını state ile gönder
        label: query.title || "Untitled Query", // Başlık
      }))
  }
/>







      </ul>
    </div>
  );
};

export default Sidebar;
