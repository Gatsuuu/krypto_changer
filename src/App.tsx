import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Plugin,
  Filler,
} from "chart.js";

const backgroundPlugin: Plugin = {
  id: "customCanvasBackgroundColor",
  beforeDraw: (chart) => {
    const ctx = chart.canvas.getContext("2d");
    if (ctx) {
      ctx.save();
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "#222222";
      ctx.fillRect(0, 0, chart.width, chart.height);
      ctx.restore();
    }
  },
};

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
  backgroundPlugin
);

function App() {
  const [prices, setPrices] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [days, setDays] = useState<number>(1);
  const [coin, setCoin] = useState<string>("ripple");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    const dayCount = Number(days); // явно приводим к числу

    axios
      .get(`http://localhost:8080/api/coin?coin=${coin}&days=${dayCount}`)
      .then((res) => {
        const raw = res.data;

        if (!raw || !Array.isArray(raw)) {
          setError("Невалидный формат данных с сервера");
          setPrices([]);
          setLabels([]);
          return;
        }

        setPrices(raw.map((item: number[]) => item[1]));

        setLabels(
          raw.map((item: number[]) => {
            const date = new Date(item[0]);

            if (dayCount === 1) {
              return (
                date.getHours().toString().padStart(2, "0") +
                ":" +
                date.getMinutes().toString().padStart(2, "0")
              );
            } else {
              return (
                date.getDate().toString().padStart(2, "0") +
                "." +
                (date.getMonth() + 1).toString().padStart(2, "0")
              );
            }
          })
        );
      })
      .catch((e) => {
        setError("Ошибка при загрузке данных");
        setPrices([]);
        setLabels([]);
        console.error(e);
      });
  }, [coin, days]);

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: "#fff" } },
      tooltip: {
        backgroundColor: "#000",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.1)" },
        ticks: { color: "#fff", maxRotation: 45, minRotation: 45 },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.1)" },
        ticks: { color: "#fff" },
      },
    },
  };

  return (
    <div style={{ width: 800, margin: "auto", color: "#fff" }}>
      <h2>{coin.toUpperCase()}/USDT графік</h2>

      <select
        value={coin}
        onChange={(e) => setCoin(e.target.value)}
        style={{ marginBottom: 16, padding: 4, fontSize: 16 }}
      >
        <option value="bitcoin">Bitcoin (BTC)</option>
        <option value="ethereum">Ethereum (ETH)</option>
        <option value="ripple">Ripple (XRP)</option>
      </select>

      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setDays(1)} style={{ marginRight: 8 }}>
          1 день
        </button>
        <button onClick={() => setDays(7)} style={{ marginRight: 8 }}>
          7 днів
        </button>
        <button onClick={() => setDays(30)}>30 днів</button>
      </div>

      {error && <div style={{ color: "red", marginBottom: 16 }}>{error}</div>}

      <Line
        data={{
          labels,
          datasets: [
            {
              label: coin.toUpperCase(),
              data: prices,
              borderColor: "#36a2eb",
              backgroundColor: "rgba(54, 162, 235, 0.2)",
              fill: true,
              tension: 0.3,
              pointBackgroundColor: "#36a2eb",
            },
          ],
        }}
        options={options}
        key={`${coin}-${days}`}
      />

      <div style={{ marginTop: 24, fontSize: 12 }}>
        <strong>Отладка меток (labels):</strong>
        <br />
        {labels.join(", ")}
        <br />
        <strong>Отладка данных (prices):</strong>
        <br />
        {prices.map((p) => p.toFixed(4)).join(", ")}
      </div>
    </div>
  );
}

export default App;
