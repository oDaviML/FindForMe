export function getLoggedUser() {
  const userJson = localStorage.getItem('loggedUser');
  return userJson ? JSON.parse(userJson) : null;
}
