const resources = {
  almoxarifados: { title: 'Almoxarifados', singular: 'almoxarifado', subtitle: 'Organize e acompanhe suas unidades de armazenamento.', fields: [{ key: 'nome', label: 'Nome do almoxarifado', type: 'text', full: true }], columns: ['nome'] },
  ferramentas: { title: 'Ferramentas', singular: 'ferramenta', subtitle: 'Gerencie as ferramentas e o patrimônio da empresa.', fields: [{ key: 'nome', label: 'Nome da ferramenta', type: 'text', full: true }, { key: 'tag', label: 'Identificação (tag)', type: 'text' }, { key: 'status', label: 'Status', type: 'select', options: ['disponível', 'em uso', 'manutenção'] }, { key: 'valor', label: 'Valor (R$)', type: 'number', min: 0, step: '0.01' }], columns: ['nome', 'tag', 'status', 'valor'] },
  epis: { title: 'EPIs', singular: 'EPI', subtitle: 'Controle equipamentos de proteção e quantidades.', fields: [{ key: 'nome', label: 'Nome do EPI', type: 'text', full: true }, { key: 'quantidade', label: 'Quantidade', type: 'number', min: 0 }, { key: 'valor', label: 'Valor unitário (R$)', type: 'number', min: 0, step: '0.01' }], columns: ['nome', 'quantidade', 'valor'] },
  'bens-consumo': { title: 'Bens de consumo', singular: 'bem de consumo', subtitle: 'Acompanhe materiais consumíveis e seus saldos.', fields: [{ key: 'nome', label: 'Nome do material', type: 'text', full: true }, { key: 'quantidade', label: 'Quantidade', type: 'number', min: 0 }, { key: 'valor', label: 'Valor unitário (R$)', type: 'number', min: 0, step: '0.01' }], columns: ['nome', 'quantidade', 'valor'] },
  funcionarios: { title: 'Funcionários', singular: 'funcionário', subtitle: 'Mantenha os dados da sua equipe organizados.', fields: [{ key: 'nome', label: 'Nome completo', type: 'text', full: true }, { key: 'matricula', label: 'Matrícula', type: 'text', full: true }], columns: ['nome', 'matricula'] },
  usuarios: { title: 'Usuários', singular: 'usuário', subtitle: 'Gerencie os usuários com acesso ao sistema.', fields: [{ key: 'nome', label: 'Nome do usuário', type: 'text', full: true }], columns: ['nome'] }
};

const labels = { nome: 'Nome', tag: 'Tag', status: 'Status', valor: 'Valor', quantidade: 'Quantidade', matricula: 'Matrícula' };
const state = { section: 'visao-geral', rows: [], editing: null, deleting: null };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

async function request(path, options = {}) {
  const response = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options });
  let data = {};
  try { data = await response.json(); } catch (_) {}
  if (!response.ok) {
    const error = new Error(data.message || 'Não foi possível concluir a operação.');
    error.status = response.status;
    throw error;
  }
  return data;
}

function showToast(message, error = false) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.className = `toast show${error ? ' error' : ''}`;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.className = 'toast', 3200);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

async function navigate(section, openForm = false) {
  state.section = section;
  $$('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.section === section));
  $('.sidebar').classList.remove('open');
  const dashboard = section === 'visao-geral';
  $('#dashboard-view').hidden = !dashboard;
  $('#resource-view').hidden = dashboard;
  $('#crumb-title').textContent = dashboard ? 'Visão geral' : resources[section].title;
  if (dashboard) await loadDashboard(); else await loadResource();
  if (openForm && !dashboard) openResourceForm();
}

async function getList(resource) {
  try { return await request(`/${resource}`); }
  catch (error) { if (error.status === 404) return []; throw error; }
}

async function loadDashboard() {
  const keys = ['ferramentas', 'epis', 'bens-consumo', 'funcionarios'];
  try {
    const [tools, epis, goods, people] = await Promise.all(keys.map(getList));
    const quantities = list => list.reduce((total, item) => total + Number(item.quantidade || 0), 0);
    const values = [tools.length, quantities(epis), quantities(goods), people.length];
    $$('#metrics .metric-card').forEach((card, index) => card.querySelector('strong').textContent = values[index].toLocaleString('pt-BR'));
    renderSummary([{ label: 'Ferramentas', value: tools.length, color: '#d49b3d' }, { label: 'EPIs', value: quantities(epis), color: '#4c7b64' }, { label: 'Bens de consumo', value: quantities(goods), color: '#7192ac' }]);
  } catch (error) {
    showToast('Não foi possível carregar o resumo. Verifique a API.', true);
    $$('.metric-card strong').forEach(el => el.textContent = '—');
  }
}

function renderSummary(items) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const stops = items.map(item => { const start = cursor; cursor += total ? item.value / total * 100 : 0; return `${item.color} ${start}% ${cursor}%`; }).join(', ');
  const donut = $('#stock-summary .donut');
  donut.style.background = total ? `conic-gradient(${stops})` : '#ecece7';
  donut.innerHTML = `<div><strong>${total.toLocaleString('pt-BR')}</strong><span>itens</span></div>`;
  $('#stock-summary .legend').innerHTML = items.map(item => `<div class="legend-row"><i style="background:${item.color}"></i><span>${item.label}</span><b>${item.value.toLocaleString('pt-BR')}</b></div>`).join('');
}

async function loadResource() {
  const config = resources[state.section];
  $('#resource-title').textContent = config.title;
  $('#resource-subtitle').textContent = config.subtitle;
  $('#new-button').textContent = `＋ Novo ${config.singular}`;
  $('#search-input').value = '';
  renderLoading(config);
  try { state.rows = await getList(state.section); renderTable(); }
  catch (error) { state.rows = []; renderTable(); showToast(error.message, true); }
}

function renderLoading(config) {
  $('#table-head').innerHTML = `<tr>${config.columns.map(key => `<th>${labels[key]}</th>`).join('')}<th>Ações</th></tr>`;
  $('#table-body').innerHTML = Array(4).fill(`<tr>${config.columns.map(() => '<td><div class="skeleton"></div></td>').join('')}<td></td></tr>`).join('');
}

function renderTable() {
  const config = resources[state.section];
  const query = $('#search-input').value.trim().toLocaleLowerCase('pt-BR');
  const rows = state.rows.filter(row => Object.values(row).some(value => String(value).toLocaleLowerCase('pt-BR').includes(query)));
  $('#table-head').innerHTML = `<tr>${config.columns.map(key => `<th>${labels[key]}</th>`).join('')}<th class="actions-heading">Ações</th></tr>`;
  $('#table-body').innerHTML = rows.map(row => `<tr>${config.columns.map(key => `<td>${formatCell(key, row[key])}</td>`).join('')}<td><div class="row-actions"><button data-edit="${row.id}" title="Editar nome" aria-label="Editar ${escapeHtml(row.nome)}">✎</button><button class="delete" data-delete="${row.id}" title="Excluir" aria-label="Excluir ${escapeHtml(row.nome)}">⌫</button></div></td></tr>`).join('');
  $('#record-count').textContent = `${rows.length} ${rows.length === 1 ? 'registro' : 'registros'}`;
  $('.table-wrap').hidden = rows.length === 0;
  $('#empty-state').hidden = rows.length !== 0;
}

function formatCell(key, value) {
  if (key === 'valor') return `<span class="value">${currency.format(Number(value || 0))}</span>`;
  if (key === 'status') { const normalized = String(value || 'não informado'); const unavailable = /manuten|indispon|uso/i.test(normalized); return `<span class="badge${unavailable ? ' unavailable' : ''}">${escapeHtml(normalized)}</span>`; }
  return escapeHtml(value);
}

function openResourceForm(row = null) {
  const config = resources[state.section];
  state.editing = row;
  $('#modal-title').textContent = row ? `Editar ${config.singular}` : `Adicionar ${config.singular}`;
  $('#form-modal .eyebrow').textContent = row ? 'EDITAR CADASTRO' : 'NOVO CADASTRO';
  $('#save-button').textContent = row ? 'Salvar alteração' : 'Salvar cadastro';
  const editableFields = row ? config.fields.filter(field => field.key === 'nome') : config.fields;
  $('#form-fields').innerHTML = editableFields.map(field => `<div class="field${field.full || row ? ' full' : ''}"><label for="field-${field.key}">${field.label}</label>${field.type === 'select' ? `<select id="field-${field.key}" name="${field.key}" required>${field.options.map(option => `<option value="${option}">${option[0].toUpperCase() + option.slice(1)}</option>`).join('')}</select>` : `<input id="field-${field.key}" name="${field.key}" type="${field.type}" value="${escapeHtml(row?.[field.key] ?? '')}" ${field.min !== undefined ? `min="${field.min}"` : ''} ${field.step ? `step="${field.step}"` : ''} required>`}</div>`).join('');
  $('#form-modal').hidden = false;
  setTimeout(() => $('#form-fields input, #form-fields select')?.focus(), 30);
}

function closeForm() { $('#form-modal').hidden = true; state.editing = null; $('#resource-form').reset(); }

async function submitForm(event) {
  event.preventDefault();
  const button = $('#save-button');
  const payload = Object.fromEntries(new FormData(event.currentTarget));
  for (const field of resources[state.section].fields.filter(field => field.type === 'number')) if (payload[field.key] !== undefined) payload[field.key] = Number(payload[field.key]);
  button.disabled = true; button.textContent = 'Salvando...';
  try {
    if (state.editing) await request(`/${state.section}/${state.editing.id}`, { method: 'PATCH', body: JSON.stringify({ nome: payload.nome }) });
    else await request(`/${state.section}`, { method: 'POST', body: JSON.stringify(payload) });
    closeForm(); showToast(state.editing ? 'Cadastro atualizado com sucesso.' : 'Cadastro realizado com sucesso.');
    await loadResource();
  } catch (error) { showToast(error.message, true); }
  finally { button.disabled = false; }
}

function askDelete(row) { state.deleting = row; $('#delete-name').textContent = row.nome; $('#delete-modal').hidden = false; }
function closeDelete() { state.deleting = null; $('#delete-modal').hidden = true; }

async function confirmDelete() {
  const row = state.deleting; if (!row) return;
  const button = $('#confirm-delete'); button.disabled = true; button.textContent = 'Excluindo...';
  try { await request(`/${state.section}/${row.id}`, { method: 'DELETE' }); closeDelete(); showToast('Cadastro excluído com sucesso.'); await loadResource(); }
  catch (error) { showToast(error.message, true); }
  finally { button.disabled = false; button.textContent = 'Sim, excluir'; }
}

$$('.nav-item').forEach(item => item.addEventListener('click', () => navigate(item.dataset.section)));
$$('[data-go]').forEach(item => item.addEventListener('click', () => navigate(item.dataset.go)));
$$('[data-quick]').forEach(item => item.addEventListener('click', () => navigate(item.dataset.quick, true)));
$('#dashboard-new').addEventListener('click', () => navigate('ferramentas', true));
$('#new-button').addEventListener('click', () => openResourceForm());
$('#resource-form').addEventListener('submit', submitForm);
$('#search-input').addEventListener('input', renderTable);
$('#refresh-button').addEventListener('click', () => navigate(state.section));
$('#confirm-delete').addEventListener('click', confirmDelete);
$$('[data-close]').forEach(item => item.addEventListener('click', closeForm));
$$('[data-delete-close]').forEach(item => item.addEventListener('click', closeDelete));
$('.menu-toggle').addEventListener('click', () => $('.sidebar').classList.toggle('open'));
$('#table-body').addEventListener('click', event => { const edit = event.target.closest('[data-edit]'); const remove = event.target.closest('[data-delete]'); if (edit) openResourceForm(state.rows.find(row => String(row.id) === edit.dataset.edit)); if (remove) askDelete(state.rows.find(row => String(row.id) === remove.dataset.delete)); });
$$('.modal-backdrop').forEach(modal => modal.addEventListener('click', event => { if (event.target === modal) modal.id === 'form-modal' ? closeForm() : closeDelete(); }));
document.addEventListener('keydown', event => { if (event.key === 'Escape') { closeForm(); closeDelete(); } });

navigate('visao-geral');
