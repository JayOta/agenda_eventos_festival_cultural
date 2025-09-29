// Dados Fictícios de Eventos (Inicial)
let eventData = [
  {
    id: 1,
    titulo: "Workshop: Arte com IA",
    descricao: "Aprenda a criar ilustrações digitais usando ferramentas de IA.",
    data: "10/Dez",
    hora: "14:00",
    local: "Sala 3",
    categoria: "workshop",
    palestrante: "Dra. Elara Vaz",
  },
  {
    id: 2,
    titulo: "Show: Banda Frequência Zero",
    descricao: "Performance eletrizante de synth-pop brasileiro.",
    data: "10/Dez",
    hora: "20:30",
    local: "Palco Principal",
    categoria: "show",
    palestrante: "Banda Frequência Zero",
  },
  {
    id: 3,
    titulo: "Exposição: Realidades Virtuais",
    descricao: "Uma imersão em obras de arte criadas em ambientes 3D.",
    data: "10/Dez",
    hora: "09:00 - 18:00",
    local: "Galeria Central",
    categoria: "exposicao",
    palestrante: "Coletivo Pixel",
  },
  {
    id: 4,
    titulo: "Workshop: Codificação Criativa",
    descricao: "Introdução ao JavaScript para criação de efeitos visuais.",
    data: "11/Dez",
    hora: "10:00",
    local: "Sala 1",
    categoria: "workshop",
    palestrante: "Prof. Leo Cunha",
  },
];

const eventsList = document.getElementById("events-list");
const filterSelect = document.getElementById("filter");
const addForm = document.getElementById("add-event-form");
const pieChart = document.getElementById("pie-chart");
const chartLegend = document.getElementById("chart-legend");

let nextEventId = eventData.length + 1;

// --- GERAÇÃO DE CARDS E RENDERIZAÇÃO ---

// Função para criar o HTML de um único card de evento
function createEventCard(event) {
  const li = document.createElement("li");
  li.className = `event-card ${event.categoria}`;
  li.setAttribute("data-id", event.id);

  // Configura o delay da animação para que os cards apareçam em cascata
  li.style.animation = `slideUp 0.6s ease-out ${event.id * 0.1}s forwards`;

  li.innerHTML = `
        <button class="remove-button" data-id="${event.id}">×</button>
        <div class="card-header">
            <small>${event.data}</small>
            <h3>${event.titulo}</h3>
        </div>
        <div class="card-body">
            <p>${event.descricao}</p>
            <p><strong>Palestrante/Artista:</strong> ${event.palestrante}</p>
            <div class="time-location">
                <span>⏰ ${event.hora}</span>
                <span>📍 ${event.local}</span>
            </div>
        </div>
    `;
  return li;
}

function renderEvents(eventsToRender) {
  eventsList.innerHTML = "";

  if (eventsToRender.length === 0) {
    eventsList.innerHTML =
      '<p style="text-align: center; grid-column: 1 / -1; padding: 50px;">Nenhum evento encontrado para esta categoria.</p>';
    return;
  }

  eventsToRender.forEach((event) => {
    const card = createEventCard(event);
    eventsList.appendChild(card);
  });

  // Adiciona listeners para os botões de remover após a renderização
  document.querySelectorAll(".remove-button").forEach((button) => {
    button.addEventListener("click", removeEvent);
  });
}

// --- LÓGICA DE FILTRO ---

function filterEvents() {
  const selectedCategory = filterSelect.value;

  let filteredEvents = eventData;

  if (selectedCategory !== "todos") {
    filteredEvents = eventData.filter(
      (event) => event.categoria === selectedCategory
    );
  }

  renderEvents(filteredEvents);
}

// --- LÓGICA DE CRUD (Adicionar/Remover) ---

function addEvent(e) {
  e.preventDefault(); // Impede o recarregamento da página

  const newEvent = {
    id: nextEventId++,
    titulo: document.getElementById("event-titulo").value,
    descricao: document.getElementById("event-descricao").value,
    data: document.getElementById("event-data").value,
    hora: document.getElementById("event-hora").value,
    local: document.getElementById("event-local").value,
    categoria: document.getElementById("event-categoria").value,
    palestrante:
      document.getElementById("event-palestrante").value || "A Definir",
  };

  eventData.push(newEvent);
  addForm.reset(); // Limpa o formulário

  // Atualiza a visualização e o gráfico
  filterEvents();
  updateChart();

  // Opcional: Notificação visual
  alert(`Evento "${newEvent.titulo}" adicionado com sucesso!`);
}

function removeEvent(e) {
  // Pega o ID do botão (que foi setado no createEventCard)
  const eventId = parseInt(e.currentTarget.getAttribute("data-id"));

  // Filtra o array, removendo o evento com o ID correspondente
  eventData = eventData.filter((event) => event.id !== eventId);

  // Atualiza a visualização e o gráfico
  filterEvents();
  updateChart();

  alert("Evento removido!");
}

// --- LÓGICA DO GRÁFICO DE PIZZA (CSS Gradient) ---

const categoryColors = {
  show: "var(--cor-show)",
  workshop: "var(--cor-workshop)",
  exposicao: "var(--cor-exposicao)",
};

function updateChart() {
  const categoryCounts = {
    show: 0,
    workshop: 0,
    exposicao: 0,
  };

  eventData.forEach((event) => {
    categoryCounts[event.categoria]++;
  });

  const totalEvents = eventData.length;
  let currentAngle = 0;
  let gradientString = "conic-gradient(";
  let legendHTML = "";

  if (totalEvents === 0) {
    pieChart.style.background = "conic-gradient(#ccc 0% 100%)";
    chartLegend.innerHTML = "<p>Nenhum evento para exibir.</p>";
    return;
  }

  // Itera sobre as categorias para construir o gradiente
  Object.keys(categoryCounts).forEach((category) => {
    const count = categoryCounts[category];
    const percentage = count / totalEvents;

    // Calcula o ângulo final do segmento
    const segmentAngle = percentage * 360;
    const nextAngle = currentAngle + segmentAngle;

    const color = categoryColors[category];
    const readableCategory =
      category.charAt(0).toUpperCase() + category.slice(1); // Ex: Show

    if (count > 0) {
      // Adiciona o segmento ao gradiente
      gradientString += `${color} ${currentAngle}deg ${nextAngle}deg, `;

      // Adiciona a legenda
      legendHTML += `
                <div class="legend-item">
                    <span class="legend-color" style="background-color: ${color}"></span>
                    ${readableCategory} (${count})
                </div>
            `;
      currentAngle = nextAngle;
    }
  });

  // Remove a vírgula e espaço extra no final e fecha o gradiente
  gradientString = gradientString.slice(0, -2) + ")";

  // Aplica o gradiente e a legenda
  pieChart.style.background = gradientString;
  chartLegend.innerHTML = legendHTML;
}

// --- INICIALIZAÇÃO ---

function initAgenda() {
  // 1. Renderiza os eventos iniciais
  renderEvents(eventData);

  // 2. Cria o gráfico inicial
  updateChart();

  // 3. Adiciona listeners de eventos
  filterSelect.addEventListener("change", filterEvents);
  addForm.addEventListener("submit", addEvent);

  // Opcional: Adiciona listener para recalcular o filtro quando a página é focada (boa prática)
  window.addEventListener("focus", filterEvents);
}

// Inicia a aplicação
document.addEventListener("DOMContentLoaded", initAgenda);
