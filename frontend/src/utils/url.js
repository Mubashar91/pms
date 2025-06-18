export function createPageUrl(page) {
  const routes = {
    'Dashboard': '/',
    'MyIssues': '/my-issues',
    'Inbox': '/inbox',
    'Projects': '/projects',
    'Initiatives': '/initiatives',
    'Cycles': '/cycles'
  };

  return routes[page] || `/${page.toLowerCase()}`;
}
