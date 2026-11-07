import { THEME_STORAGE_KEY } from "@/core/theme/theme-storage";

const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Inline script executed before paint. Keeps localStorage and cookie in sync.
 * Priority: localStorage → cookie → dark default (SDD A29).
 * Also marks <html class="js"> so section reveal only hides content when JS runs.
 */
export const themeInitScript = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)};var maxAge=${THEME_COOKIE_MAX_AGE};function parse(v){return v==="light"||v==="dark"?v:null;}function readCookie(){var m=document.cookie.match(new RegExp("(?:^|; )"+k+"=([^;]*)"));if(!m||!m[1])return null;try{return parse(decodeURIComponent(m[1]));}catch(e){return parse(m[1]);}}var stored=null;try{stored=parse(localStorage.getItem(k));}catch(e){}if(!stored)stored=readCookie();var theme=stored||"dark";var root=document.documentElement;root.classList.add("js");root.classList.toggle("dark",theme==="dark");try{localStorage.setItem(k,theme);}catch(e){}document.cookie=k+"="+theme+";path=/;max-age="+maxAge+";SameSite=Lax";}catch(e){}})();`;
