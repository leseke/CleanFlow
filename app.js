import { parseCSV, cleanDataset, toCSV } from './src/cleaner.mjs';

const $ = s => document.querySelector(s);
const fileInput=$('#fileInput'), sampleBtn=$('#sampleBtn'), workspace=$('#workspace');
let current=null, original=null, originalName='cleanflow.csv';

fileInput.addEventListener('change', async e => { const f=e.target.files[0]; if(!f)return; processText(await f.text(), f.name); });
sampleBtn.addEventListener('click', async()=>{ const text=await (await fetch('./sample/clients_sales.csv')).text(); processText(text,'clients_sales_demo.csv'); });
$('#downloadBtn').addEventListener('click',()=>{ if(!current)return; download(toCSV(current.headers,current.rows,';'), originalName.replace(/\.csv$/i,'')+'_clean.csv','text/csv;charset=utf-8'); });
$('#reportBtn').addEventListener('click',()=>{ if(!current)return; download(JSON.stringify(current.report,null,2), originalName.replace(/\.csv$/i,'')+'_report.json','application/json'); });

function processText(text,name){ original=parseCSV(text); current=cleanDataset(original); originalName=name; $('#fileName').textContent=name; workspace.classList.remove('hidden'); render(); workspace.scrollIntoView({behavior:'smooth',block:'start'}); }
function render(){ const r=current.report; $('#stats').innerHTML=[['Lignes analysées',r.inputRows],['Lignes propres',r.outputRows],['Doublons supprimés',r.duplicatesRemoved],['Corrections',r.trimmedCells+r.emailsNormalized+r.phonesNormalized+r.datesNormalized]].map(([a,b])=>`<div class="stat"><span>${a}</span><strong>${b}</strong></div>`).join('');
  const alerts=r.invalidEmails+r.invalidPhones+r.invalidDates; const q=$('#quality'); q.className='quality '+(alerts?'warn':'good'); q.textContent=alerts?`${alerts} valeur(s) restent à vérifier manuellement. Le fichier a été nettoyé sans inventer de donnée.`:'Aucune anomalie de format restante détectée sur les colonnes reconnues.';
  renderTable('#beforeTable', original.rows[0]||[], original.rows.slice(1,7)); renderTable('#afterTable',current.headers,current.rows.slice(0,6));
  $('#beforeCount').textContent=`aperçu ${Math.min(6,r.inputRows)} / ${r.inputRows}`; $('#afterCount').textContent=`aperçu ${Math.min(6,r.outputRows)} / ${r.outputRows}`;
  const items=[['Espaces corrigés',r.trimmedCells],['Emails normalisés',r.emailsNormalized],['Emails invalides',r.invalidEmails],['Téléphones normalisés',r.phonesNormalized],['Téléphones à vérifier',r.invalidPhones],['Dates normalisées',r.datesNormalized],['Dates à vérifier',r.invalidDates],['Cellules vides',r.emptyCells],['Doublons supprimés',r.duplicatesRemoved]];
  $('#reportList').innerHTML=items.map(([label,n])=>`<div class="report-item"><strong>${n}</strong><span>${label}</span></div>`).join(''); }
function renderTable(sel,headers,rows){ const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); $(sel).innerHTML=`<thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${headers.map((_,i)=>`<td>${esc(row[i]??'')}</td>`).join('')}</tr>`).join('')}</tbody>`; }
function download(content,name,type){ const blob=new Blob([content],{type}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000); }