// TEST COPY settings. This file goes ONLY in the "test" folder on GitHub, never in the main folder.
//
// url: your Convex HTTP address + /exec, e.g. "https://happy-otter-123.convex.site/exec"
//      (Convex dashboard → Settings → URL & Deploy Key → "HTTP Actions URL", then add /exec)
// key: the same value as SECRET in Code.gs (the test copy uses the same Code.gs as the live site)
window.FEEDBACK_CONFIG = {
  url: "https://colorless-falcon-665.eu-west-1.convex.site/exec",
  key: "mybbIp-pobfod-2xabgy-Cvswe345-Pol34",
  env: "test"
};

// ---- test mode: keep everything this copy saves on the phone or computer separate from the live site ----
(function () {
  var p = "test:";
  var S = Storage.prototype, get = S.getItem, set = S.setItem, rem = S.removeItem;
  S.getItem = function (k) { return get.call(this, p + k); };
  S.setItem = function (k, v) { return set.call(this, p + k, v); };
  S.removeItem = function (k) { return rem.call(this, p + k); };
  // a red TEST bar, so it is never mistaken for the live site
  document.title = "TEST · " + document.title;
  document.addEventListener("DOMContentLoaded", function () {
    document.title = document.title.indexOf("TEST") === 0 ? document.title : "TEST · " + document.title;
    var bar = document.createElement("div");
    bar.textContent = "TEST COPY · test data only · teachers don't see this";
    bar.style.cssText = "position:sticky;top:0;z-index:999;background:#C62828;color:#fff;text-align:center;font:600 13px system-ui,sans-serif;padding:6px 8px;letter-spacing:.3px";
    document.body.insertBefore(bar, document.body.firstChild);
  });
})();
