import React from "react";
import {
  
  Home,
  Users,
  Database,
  Calendar1,
  GraduationCap,
} from "lucide-react";

const getIcon = (name: string): React.ReactElement => {
  const cls = "h-5 w-5"; // Slightly larger for better visibility
  switch (name) {
    case "Dashboard":
      return React.createElement(Home, { className: cls });
    case "Users":
      return React.createElement(Users, { className: cls });
    case "Year":
      return React.createElement(Calendar1, { className: cls });
    case "Grade":
      return React.createElement(GraduationCap, { className: cls });
    case "User Roles":
      return React.createElement(Users, { className: cls });
    default:
      return React.createElement(Database, { className: cls });
  }
};

export default getIcon;