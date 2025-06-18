// src/utils/createPageUrl.js

export function createPageUrl(pageName) {
  switch (pageName) {
    case "Dashboard":
      return "/dashboard";
    case "MyIssues":
      return "/my-issues";
    case "Inbox":
      return "/inbox";
    case "Projects":
      return "/projects";
    case "Initiatives":
      return "/initiatives";
    case "Cycles":
      return "/cycles";
    case "Timeline":
      return "/timeline";
    case "Issues":
      return "/issues";
    case "Pulse":
      return "/pulse";
    case "Team":
      return "/team";
    case "ProjectDetail":
      return "/projects/detail"; // or maybe `/projects/detail?id=123` later
    default:
      return "/";
  }
}
