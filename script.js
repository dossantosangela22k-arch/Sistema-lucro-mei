const $ = (id) => document.getElementById(id);
function formatBRL(v){
  return Number(v).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
}
function carregarHistorico(){
  const dados = JSON.parse(localStorage.getItem('lucroMeiHistorico')||'[]');
  const lista = $('listaHistorico');
  lista.innerHTML = '';
  if(dados.length===0){ lista.innerHTML = '<span style="color:#94a3b8">Nenhum cálculo ainda</span>'; return; }
  dados.slice(-5).reverse().forEach(item=>{
    const div = document.createElement('div');
    div.className='item-hist';
    div.innerHTML = `<span>${item.data} • ${item.margem}% margem</span><strong>${formatBRL(item.lucro)}</strong>`;
    lista.appendChild(div);
  });
}
function salvarHistorico(lucro, margem){
  const dados = JSON.parse(localStorage.getItem('lucroMeiHistorico')||'[]');
  const hoje = new Date().toLocaleDateString('pt-BR',{month:'short',year:'2-digit'});
  dados.push({data:hoje, lucro, margem, ts:Date.now()});
  localStorage.setItem('lucroMeiHistorico', JSON.stringify(dados));
  carregarHistorico();
}
function calcular(){
  const receita = parseFloat($('receita').value)||0;
  const fixa = parseFloat($('despesaFixa').value)||0;
  const variavel = parseFloat($('despesaVar').value)||0;
  if(receita<=0){ alert('Informe a receita do mês'); return; }
  const despesas = fixa + variavel;
  const lucro = receita - despesas;
  const margem = receita>0 ? ((lucro/receita)*100).toFixed(1) : 0;
  window._ultimoCalculo = {receita, fixa, variavel, despesas, lucro, margem};
  const resDiv = $('resultado');
  resDiv.classList.remove('hidden');
  $('lucroValor').textContent = `Lucro: ${formatBRL(lucro)}`;
  $('lucroValor').style.color = lucro>=0 ? '#16a34a' : '#dc2626';
  $('margemInfo').textContent = `${margem}% margem • Receita: ${formatBRL(receita)} • Despesas: ${formatBRL(despesas)}`;
  $('margemInfo').style.background = lucro>=0 ? '#dcfce7' : '#fee2e2';
  $('margemInfo').style.color = lucro>=0 ? '#15803d' : '#991b1b';
  const percVar = despesas>0 ? ((variavel/despesas)*100).toFixed(0) : 0;
  $('detalheDespesa').innerHTML = `Fixas: ${formatBRL(fixa)} | Variáveis: ${formatBRL(variavel)} (${percVar}% das despesas)`;
  salvarHistorico(lucro, margem);
  resDiv.scrollIntoView({behavior:'smooth', block:'center'});
}
$('btnCalcular').addEventListener('click', calcular);
['receita','despesaFixa','despesaVar'].forEach(id=>{
  $(id).addEventListener('keydown', e=>{ if(e.key==='Enter') calcular(); });
});
$('btnSimular').addEventListener('click', ()=>{
  $('simulador').classList.remove('hidden');
  $('simulador').scrollIntoView({behavior:'smooth'});
});
$('btnCalcularMeta').addEventListener('click', ()=>{
  const meta = parseFloat($('metaLucro').value)||0;
  const despesas = window._ultimoCalculo ? window._ultimoCalculo.despesas : (parseFloat($('despesaFixa').value)||0)+(parseFloat($('despesaVar').value)||0);
  if(meta<=0){ alert('Informe quanto quer lucrar'); return; }
  const necessario = meta + despesas;
  $('resultadoMeta').textContent = `Para lucrar ${formatBRL(meta)}, você precisa faturar ${formatBRL(necessario)} (despesas de ${formatBRL(despesas)} + meta).`;
});
$('btnPDF').addEventListener('click', ()=>{
  if(!window._ultimoCalculo){ alert('Calcule primeiro'); return; }
  const {jsPDF} = window.jspdf;
  const doc = new jsPDF();
  const c = window._ultimoCalculo;
  doc.setFontSize(16);
  doc.text('Relatorio MEI - ContTech', 14, 20);
  doc.setFontSize(11);
  doc.text(`Desenvolvido por Angela Barbosa - Bacharel em Contabeis + ADS`, 14, 28);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 14, 36);
  doc.line(14,38,196,38);
  doc.text(`Receita: ${formatBRL(c.receita)}`, 14, 50);
  doc.text(`Despesas Fixas: ${formatBRL(c.fixa)}`, 14, 58);
  doc.text(`Despesas Variaveis: ${formatBRL(c.variavel)}`, 14, 66);
  doc.text(`Total Despesas: ${formatBRL(c.despesas)}`, 14, 74);
  doc.setFontSize(13);
  doc.text(`LUCRO: ${formatBRL(c.lucro)} - Margem ${c.margem}%`, 14, 86);
  doc.save(`relatorio-mei-${new Date().toISOString().slice(0,10)}.pdf`);
});
$('btnLimpar').addEventListener('click', ()=>{
  if(confirm('Limpar histórico?')){ localStorage.removeItem('lucroMeiHistorico'); carregarHistorico(); }
});
carregarHistorico();
if(!$('receita').value){ $('receita').value = 5000; $('despesaFixa').value = 1200; $('despesaVar').value = 800; }
