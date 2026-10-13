/**
 * Single-owner manual browser login console.
 * The Bearer token is held only in JS memory, never in localStorage, cookies,
 * query strings, or server logs. No write/browser mutation tools are exposed.
 */
export const ownerHtml = `<!doctype html>
<html lang="ru"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer">
<title>VIIVERSION Personal Web — Live View</title>
<style>
:root { color-scheme: dark; font-family: system-ui, sans-serif; }
body { background:#0b1018; color:#e9edf5; margin:0; padding:26px 14px; }
main { max-width:710px; margin:0 auto; }
section { border:1px solid #384355; border-radius:14px; padding:20px; margin:16px 0; background:#151d2a; }
h1{font-size:1.7rem;margin:0 0 8px} h2{font-size:1.1rem;margin:0 0 10px}
p,small{color:#b8c4d5;line-height:1.5} label{display:block;margin:14px 0 4px}
input{box-sizing:border-box;width:100%;padding:12px;border:1px solid #56657b;border-radius:8px;color:#fff;background:#0b1018;font-size:16px}
button,.button{display:inline-block;border:1px solid #7d91b0;background:#22344b;color:#fff;padding:11px 16px;border-radius:9px;cursor:pointer;text-decoration:none;margin:10px 7px 0 0;font-size:15px}
button:hover,.button:hover{background:#38526e}button:disabled{opacity:.4;cursor:not-allowed}a{color:#9cd7ff}
#live{display:none}#status{white-space:pre-wrap;overflow-wrap:anywhere}
.tag{font-size:.79rem;color:#abc2d9}
</style></head><body><main>
<h1>VIIVERSION Personal Web</h1>
<p>Личный удалённый браузер. Пароли сайтов вводятся только в официальных формах сайтов внутри Live View.</p>
<section><h2>1. Доступ владельца</h2>
<label for="token">Личный токен Personal Web</label>
<input id="token" type="password" autocomplete="off" spellcheck="false" placeholder="Токен из менеджера паролей">
<p><small>Токен не сохраняется в браузере и исчезает после закрытия вкладки. Никогда не вводите здесь пароль GitHub или Cloudflare.</small></p></section>
<section><h2>2. Открыть сайт для входа</h2>
<label for="url">HTTPS-адрес разрешённого сайта</label>
<input id="url" type="url" value="https://viiversion.com/" autocomplete="url">
<button id="start" type="button">Открыть Chrome / Live View</button>
<div id="live">
<p>Ссылка временная и приватная. Перейдите в браузер, вручную войдите в аккаунт и вернитесь на исходный сайт.</p>
<a id="liveLink" class="button" target="_blank" rel="noopener noreferrer">Перейти в Live View</a>
<button id="commit" type="button">Сохранить браузерную сессию</button>
<p class="tag">При смене вкладки или закрытии этой страницы потребуется начать новую процедуру.</p>
</div></section>
<section><h2>3. Управление</h2>
<button id="list" type="button">Показать сохранённые сессии</button>
<button id="scrape" type="button">Прочитать сайт с сохранённой сессией</button>
<button id="inspect" type="button">Осмотреть страницу</button>
<button id="revoke" type="button">Удалить сессию этого сайта</button>
<p id="status" role="status" aria-live="polite">Готово к подключению.</p>
</section>
<section><h2>4. Одобряемые действия</h2>
<p>Сначала создайте план, просмотрите операции, затем отдельно подтвердите запуск. Не передавайте пароли или коды.</p>
<label for="actions">Шаги в JSON</label>
<textarea id="actions" rows="5">[{"type":"scroll","pixels":300}]</textarea>
<button id="propose" type="button">Подготовить план</button>
<button id="approve" type="button">Одобрить действия</button>
<button id="execute" type="button">Выполнить план</button>
<p id="approvalStatus" role="status" aria-live="polite">План ещё не подготовлен.</p>
</section>
</main><script src="/owner.js" defer></script></body></html>`;

export const ownerJs = `(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  let loginId = null;
  const status = (message) => { $("status").textContent = message; };
  const token = () => $("token").value.trim();
  async function call(path, args) {
    if (token().length < 32) throw new Error("Введите личный токен доступа (минимум 32 символа).");
    const response = await fetch(path, {
      method: "POST", credentials: "omit", cache: "no-store",
      headers: { Authorization: "Bearer " + token(), "Content-Type": "application/json" },
      body: JSON.stringify(args)
    });
    const json = await response.json();
    if (!response.ok || !json.ok) throw new Error(json.error || "Ошибка браузера: HTTP " + response.status);
    return json;
  }
  async function run(work) {
    for (const b of document.querySelectorAll("button")) b.disabled = true;
    try { await work(); }
    catch (error) { status(error.message || "Неизвестная ошибка"); }
    finally { for (const b of document.querySelectorAll("button")) b.disabled = false; }
  }
  $("start").addEventListener("click", () => run(async () => {
    loginId = null; $("live").style.display = "none";
    const result = await call("/v1/session/start", { url: $("url").value });
    loginId = result.loginId;
    const link = new URL(result.liveViewUrl);
    if (link.protocol !== "https:" || link.hostname !== "live.browser.run") throw new Error("Некорректная ссылка Live View.");
    $("liveLink").href = result.liveViewUrl;
    $("live").style.display = "block";
    status("Chrome открыт. Перейдите по ссылке, войдите на сайте, вернитесь на нужную вкладку и нажмите «Сохранить». Время действия до: " + result.expiresAt);
  }));
  $("commit").addEventListener("click", () => run(async () => {
    if (!loginId) throw new Error("Сначала откройте удалённый Chrome.");
    const r = await call("/v1/session/commit", { loginId });
    loginId = null; $("live").style.display = "none";
    status("Сохранено: " + r.origin + ". Cookies: " + r.cookieCount +
      ". Сессия действительна до " + r.expiresAt + (r.warning ? ". Внимание: " + r.warning : ""));
  }));
  $("list").addEventListener("click", () => run(async () => {
    const r = await call("/v1/session/list", {});
    status(r.sessions.length ? r.sessions.map(s => s.origin + " — до " + new Date(s.expiresAt).toLocaleString()).join("\\n") : "Сохранённых сессий нет.");
  }));
  $("scrape").addEventListener("click", () => run(async () => {
    const r = await call("/v1/session/scrape", { url: $("url").value });
    status("Успешно прочитано: " + r.document.title + " — " + r.document.url);
  }));
  $("inspect").addEventListener("click", () => run(async () => {
    const r = await call("/v1/session/explore", { url: $("url").value, steps: [] });
    status("Осмотрена страница: " + r.document.title + ". Форм: " + (r.pageControls?.forms?.length ?? 0) + ". Элементов: " + (r.pageControls?.controls?.length ?? 0));
  }));
  $("revoke").addEventListener("click", () => run(async () => {
    if (!confirm("Удалить локально сохранённую сессию для указанного сайта?")) return;
    const r = await call("/v1/session/revoke", { url: $("url").value });
    status("Сессия удалена: " + r.origin);
  }));
})();`;
