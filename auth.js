const VOIAGER_AUTH_COOKIE = "eventapp_auth=grwthruothers";

if (!document.cookie.split("; ").includes(VOIAGER_AUTH_COOKIE)) {
  const destination = encodeURIComponent(location.pathname.split("/").pop() + location.search);
  location.replace(`login.html?next=${destination}`);
}
