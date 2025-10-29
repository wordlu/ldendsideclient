let keycloakInfo = {
  ip: window.server.keycloakInfoIp,
  login:"",
  logout:"",
  client_name: window.server.client_name,
  client_id: window.server.client_id,
  login_redirect_uri:`${window.location.origin}/SystemSelection`,
  logout_redirect_uri:`${location.protocol}//${location.host.split('.')[0]}.${location.host.substring(location.host.indexOf('.')+1)}`
};
setKeycloak();

function setKeycloak(){

  // set login uri
  keycloakInfo.login = `${keycloakInfo.ip}/auth/realms/ld-user/protocol/openid-connect/auth?response_type=code&scope=openid+email+roles&client_id=${keycloakInfo.client_name}&redirect_uri=${keycloakInfo.login_redirect_uri}`;

  // set logout uri
  keycloakInfo.logout = `${keycloakInfo.ip}/auth/realms/ld-user/protocol/openid-connect/logout?redirect_uri=${keycloakInfo.logout_redirect_uri}`;
}

export default keycloakInfo;
