import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import logo1 from "../assets/logo-1.png"

const Dashboard = () => {
  const [userInfo, setUserInfo] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/users/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUserInfo(response.data);
      } catch (error) {
        console.error("Error fetching user info:", error.message);
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <div style={{ padding: "50px 150px 50px 150px",textAlign: "justify", color: "whitesmoke" }}>
      <h1 className="text-center">Welcome to the Personnel Management and  <br />Control Panel (PMCP)</h1>
      <div style={{display: "flex", textAlign: "center", justifyContent: "center"}}>
      <img style={{width: "300px"}} src={logo1} alt="hansel"/>
      </div>
      <br />
      <p>
      Effective personnel management is a critical component for the smooth
operation of any organization. As businesses grow, the challenges associated
with managing employee records, scheduling, attendance tracking, and
payroll processing become increasingly complex. To address these
challenges, this project, titled "Personnel Management and Control Panel,"
aims to provide a comprehensive solution that simplifies and automates key
aspects of personnel management. </p>
<p>The system is designed to centralize and securely manage employee
data while enhancing workflow efficiency. By offering features such as
attendance tracking, shift management, absence monitoring, and payroll
calculations, the system ensures that managers and administrators have
complete control over their team operations. A key component of the project is
its robust permission system, which allows administrators to assign specific
personnel to authorized users. This feature not only improves operational
efficiency but also ensures data security by restricting access to relevant
information.</p>
<p>To further enhance its functionality, the project integrates an AI-powered
agent capable of translating natural language queries into SQL commands.
This innovative feature empowers managers to access detailed reports and
critical data insights without requiring technical expertise. By enabling natural
language interaction, the system significantly reduces the time and complexity
involved in generating custom reports, providing managers with actionable
information faster and more efficiently.
Technologically, the project leverages an SQL database for secure and
efficient data storage, a React-based frontend for an intuitive user experience,
and a Node.js backend for seamless communication and system reliability. By
combining these technologies with AI-driven capabilities, the Personnel
Management and Control Panel provides a scalable, user-friendly, and
efficient platform for modern personnel management, delivering measurable
benefits to both managers and employees.
</p>

      <div style={{ marginTop: "20px" }}>
       
      <h2>App Highlights:</h2>
<ul>
  <li>
    <strong>Comprehensive Graduation Project:</strong> This platform is the culmination of rigorous academic research and hands-on development, representing a solution tailored to the modern needs of personnel management. Its design addresses real-world challenges faced by organizations of all sizes, offering scalability and adaptability for long-term use.
  </li>
  <br />
  <li>
    <strong>AI-Powered Insights and Automation:</strong> The integration of an AI-powered agent transforms natural language queries into actionable SQL commands. This feature allows managers and administrators to effortlessly generate complex, data-driven reports without requiring technical expertise. From analyzing attendance trends to extracting detailed performance metrics, the AI assistant empowers decision-makers with rapid, accurate insights.
  </li>
  <br />

  <li>
    <strong>Cutting-Edge Technology Stack:</strong> The system leverages an SQL database for robust and secure data management, a React-based frontend for an intuitive and dynamic user experience, and a Node.js backend to facilitate seamless communication and reliable performance. Together, these technologies form a solid, modern infrastructure that ensures efficiency, reliability, and ease of maintenance.
  </li>
  <br />

  <li>
    <strong>Advanced Role-Based Access Control:</strong> The platform implements a granular permissions model that defines access rights based on roles and responsibilities. Administrators have the ability to configure system-wide settings and access all data, while department-level users are restricted to viewing and managing only their assigned personnel and tasks. This approach enhances security, minimizes errors, and ensures that sensitive information is only accessible to authorized individuals.
  </li>
  <br />

  <li>
    <strong>Real-Time Collaboration and Notifications:</strong> The system enables real-time updates and notifications for tasks, shifts, and announcements, ensuring that teams stay informed and aligned. Collaboration is further enhanced by features such as shared task lists, departmental announcements, and dynamic dashboards.
  </li>
  <br />

  <li>
    <strong>Scalability and Extensibility:</strong> The platform is built with scalability in mind, capable of handling growing organizational needs as the workforce expands. Its modular design allows for easy integration of additional features or third-party tools, ensuring it can adapt to future requirements without disrupting current workflows.
  </li>
</ul>

      </div>
      <div style={{ marginTop: "20px" }}>
      <h2>Core Features:</h2>
<ul>
  <li>
    <strong>Advanced Attendance Tracking:</strong> Track personnel attendance with precision using detailed logs that include timestamps and activity summaries. Automated calculations provide insights into working hours, overtime, and absences, enabling better workforce planning and compliance with labor regulations.
  </li>
  <br />

  <li>
    <strong>Dynamic Shift Management:</strong> Create, assign, and manage shifts with flexibility to accommodate departmental and organizational requirements. The system includes features for assigning personnel to shifts, monitoring schedule adherence, and adjusting shifts dynamically based on operational needs.
  </li>
  <br />

  <li>
    <strong>Streamlined Task Management:</strong> Empower managers and team leaders to assign tasks efficiently with real-time tracking of statuses such as pending, approved, or completed. Integrated approval workflows and notifications ensure that tasks are completed on time and with accountability.
  </li>
  <br />

  <li>
    <strong>Comprehensive Payroll Automation:</strong> Automate payroll processes by integrating attendance and shift data. The system calculates salaries, overtime, and deductions accurately, reducing administrative workload and ensuring timely payments for all employees.
  </li>
  <br />

  <li>
    <strong>Customizable Shortcuts:</strong> Enhance productivity by adding frequently accessed links to the dashboard. Users can create personalized shortcuts to key modules, making navigation intuitive and time-efficient.
  </li>
  <br />

  <li>
    <strong>AI-Driven Query System:</strong> Retrieve actionable insights using natural language queries. The AI-powered agent converts user input into SQL commands, allowing for instant access to tailored reports and data analysis without requiring technical expertise.
  </li>
  <br />

  <li>
    <strong>Real-Time Notifications and Announcements:</strong> Keep personnel informed with timely notifications and announcements. Administrators can send updates about tasks, shifts, or company news, ensuring that communication is clear and effective.
  </li>
  <br />

  <li>
    <strong>Robust Security and Role-Based Access Control:</strong> Protect sensitive data with a comprehensive role-based access control system. Administrators have complete control, while departmental users only access data relevant to their roles, ensuring both security and operational efficiency.
  </li>
  <br />

  <li>
    <strong>Data-Driven Analytics and Reporting:</strong> Generate detailed reports on attendance, task performance, payroll, and more. Customizable dashboards and visualizations provide actionable insights for strategic decision-making.
  </li>
  <br />

  <li>
    <strong>Scalability and Extensibility:</strong> Designed with growth in mind, the platform can easily accommodate additional users, departments, and features. The modular architecture ensures smooth integration of new functionalities as organizational needs evolve.
  </li>
</ul>
      </div>
     
      <div style={{ marginTop: "20px" }}>
        <h2>Impact:</h2>
        <p>
          By simplifying personnel management, the PMCP empowers organizations to focus on strategic growth while minimizing administrative overhead. Its intuitive design and robust capabilities make it a transformative tool for businesses seeking efficiency, accuracy, and innovation in personnel operations.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
