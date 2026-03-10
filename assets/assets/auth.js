// assets/auth.js
(function () {
  const KEY_PREFIX = "fxportal_loggedin_";

  // ログイン有効期限（分）
  const SESSION_TTL_MINUTES = 180;

  function _loginTimeKey(gate) {
    return "fxportal_login_time_" + gate;
  }

  function getCred(serviceKey) {
    const cfg = window.APP_CONFIG && window.APP_CONFIG.credentials;
    if (!cfg || !cfg[serviceKey]) return null;
    return cfg[serviceKey];
  }

  function setLoggedIn(serviceKey, value) {
    sessionStorage.setItem(KEY_PREFIX + serviceKey, value ? "1" : "0");
  }

  function isLoggedIn(serviceKey) {
    return sessionStorage.getItem(KEY_PREFIX + serviceKey) === "1";
  }

  function logout(serviceKey) {
    setLoggedIn(serviceKey, false);
    // ログイン時刻も消す
    sessionStorage.removeItem(_loginTimeKey(serviceKey));
  }

  function login(serviceKey, id, pass) {
    const cred = getCred(serviceKey);
    if (!cred) return { ok: false, message: "設定が見つかりません。" };

    const ok = id === cred.id && pass === cred.pass;
    if (ok) {
      setLoggedIn(serviceKey, true);
      // ログイン時刻を保存
      sessionStorage.setItem(_loginTimeKey(serviceKey), String(Date.now()));
      return { ok: true, message: "" };
    }
    return { ok: false, message: "IDまたはパスワードが違います。" };
  }

  // ダッシュボード用：ログインしてなければログイン画面へ戻す
  function requireLogin(serviceKey, loginPath) {
    // 期限切れチェック
    const t = Number(sessionStorage.getItem(_loginTimeKey(serviceKey)) || "0");
    if (t && (Date.now() - t) > SESSION_TTL_MINUTES * 60 * 1000) {
      logout(serviceKey);
      window.location.replace(loginPath);
      return;
    }

    if (!isLoggedIn(serviceKey)) {
      window.location.replace(loginPath);
    }
  }

  // 戻る/進むのキャッシュ復元対策（ログアウト後に戻ってもガードを通す）
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) window.location.reload();
  });

  window.Auth = { login, logout, isLoggedIn, requireLogin };
})();