import fs from 'node:fs';

const p = 'scripts/patch-telegram-identities.mjs';
let s = fs.readFileSync(p, 'utf8');
const startNeedle = "  s = replaceOnce(s,\n    `    connection_type,effective_type,downlink,rtt,save_data,webdriver,ua_data,page_url,query_string,url_hash,raw_referrer,request_referer";
const endNeedle = "    'worker insert columns');";
const start = s.indexOf(startNeedle);
if (start < 0) throw new Error('insert patch start not found');
const endStart = s.indexOf(endNeedle, start);
if (endStart < 0) throw new Error('insert patch end not found');
const end = endStart + endNeedle.length;
const replacement = `  s = replaceOnce(s,
    \`    connection_type,effective_type,downlink,rtt,save_data,webdriver,ua_data,page_url,query_string,url_hash,raw_referrer,request_referer\`,
    \`    connection_type,effective_type,downlink,rtt,save_data,webdriver,ua_data,page_url,query_string,url_hash,raw_referrer,request_referer,
    telegram_user_id,telegram_username,telegram_first_name,telegram_last_name,telegram_language_code,telegram_is_premium,
    telegram_photo_url,telegram_start_param,telegram_auth_date,telegram_added_to_attachment_menu,telegram_allows_write_to_pm,
    telegram_chat_type,telegram_chat_instance,telegram_verified,telegram_verification\`,
    'worker insert columns');
  s = replaceOnce(s,
    "Array.from({ length: 68 }, () => '?')",
    "Array.from({ length: 83 }, () => '?')",
    'worker placeholder count');`;
s = s.slice(0, start) + replacement + s.slice(end);
fs.writeFileSync(p, s);
console.log('Fixed Telegram patch SQL anchor.');
