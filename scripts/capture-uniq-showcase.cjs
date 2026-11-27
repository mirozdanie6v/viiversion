const {chromium}=require('playwright');
const sharp=require('sharp');
const fs=require('node:fs');
const path=require('node:path');
const out='site_assets/cases';
const url='https://uniq-smart-rent.mirozdanie6v.workers.dev/';
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
 const context=await browser.newContext({viewport:{width:1280,height:800},locale:'ru-RU',deviceScaleFactor:1});
 const page=await context.newPage();
 // Public demo screenshots only: never submit or retrieve real customer data.
 await page.route('**/api/**',route=>route.fulfill({status:503,contentType:'application/json',body:'{"demo":true}'}));
 await page.route('https://dashboard.viiversion.com/**',route=>route.abort());
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
 await page.locator('[data-role="client"]').waitFor();
 const ids=await page.evaluate(()=>window.UNIQ_FLEET.slice(0,3).map(v=>({id:v.id,estimate:Number(v.dailyVnd||0)*3})));
 if(ids.length!==3)throw Error('Missing fleet');
 await page.evaluate(ids=>{
  localStorage.setItem('uniq-language-v1','ru');
  localStorage.setItem('uniq-data-requests-v3',JSON.stringify(ids.map((v,i)=>({id:'DEMO-'+(i+1),vehicleId:v.id,client:'Demo Rider '+(i+1),contact:'demo-'+(i+1)+'@example.invalid',from:'2026-12-10',to:'2026-12-13',status:['new','confirmed','active'][i],estimate:v.estimate,estimatedTotalVnd:v.estimate,createdAt:'2026-11-28T10:00:00Z',persistence:'local'}))));
  sessionStorage.setItem('uniq-role-v2','client');
 },ids);
 await page.reload({waitUntil:'domcontentloaded'});
 await page.locator('[data-role="client"]').waitFor();
 fs.mkdirSync(out,{recursive:true});
 const nav=async id=>{await page.locator('.bottom-nav [data-go="'+id+'"]').click();await page.waitForTimeout(350);};
 const role=async id=>{await page.locator('[data-role="'+id+'"]').click();await page.waitForTimeout(350);};
 const snap=async(name,selector)=>{
  if(selector){const el=page.locator(selector).first();await el.waitFor();await el.scrollIntoViewIfNeeded();}
  await page.waitForTimeout(500);
  await page.evaluate(async()=>{await document.fonts.ready;const visible=[...document.images].filter(i=>{const r=i.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight});await Promise.all(visible.map(i=>Promise.race([i.decode().catch(()=>{}),new Promise(r=>setTimeout(r,3500))])));});
  const broken=await page.evaluate(()=>[...document.images].filter(i=>{const r=i.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight&&i.complete&&i.naturalWidth===0}).length);
  if(broken)throw Error(name+': broken visible images: '+broken);
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error(name+': overflow');
  const png=await page.screenshot({animations:'disabled'});
  await sharp(png).webp({quality:84}).toFile(path.join(out,'uniq-'+name+'.webp'));
  console.log('Captured',name);
 };
 await role('client');await nav('home');await snap('client-home');
 await nav('catalog');await page.locator('.vehicle-card').first().waitFor();await snap('client-catalog');
 await page.locator('.vehicle-card').first().click();await snap('client-detail','.detail');
 await page.locator('[data-book]').first().click();await snap('client-booking','#bookForm');await page.locator('.modal-x').first().click();
 await nav('requests');await snap('client-requests','.request-list');
 const checkout=page.locator('[data-pay-request]').first();if(await checkout.count()){await checkout.click();await snap('client-payment','.payment-sheet');await page.locator('[data-finish-close]').first().click();}
 await nav('contacts');await snap('client-contacts','.contact-grid');
 await role('employee');await snap('employee-dashboard','.metrics');
 await nav('requests');await snap('employee-requests','.request-list');
 const paymentState=page.locator('.finish-payment-state').first();if(await paymentState.count())await snap('employee-payment','.finish-payment-state');
 await nav('fleet');await snap('employee-fleet','.fleet-table');
 await nav('handover');await snap('employee-handover','.request-list');
 await role('owner');await snap('owner-overview','.owner-metrics');
 await snap('owner-status','.status-bars');
 const profile=page.locator('[data-client-profile]').first();if(await profile.count()){await profile.click();await snap('owner-clients','.profile-sheet');await page.locator('[data-finish-close]').first().click();}else{const clients=page.locator('main .section').filter({hasText:/Последние клиенты|Recent clients/}).first();if(await clients.count()){await clients.scrollIntoViewIfNeeded();await snap('owner-clients');}else{console.warn('Owner client profile not available in deployed build');}}
 await nav('requests');await snap('owner-requests','.request-list');
 await nav('fleet');await snap('owner-fleet','.metrics');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
