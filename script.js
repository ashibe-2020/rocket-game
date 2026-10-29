
const parts = {
  engine: [
    { name: "標準エンジン", detail: "推力 800 kN", thrust: 800, mass: 3, efficiency: 75, cost: 30 },
    { name: "高出力エンジン", detail: "推力 1200 kN", thrust: 1200, mass: 5, efficiency: 85, cost: 50 }
  ],
  tank: [
    { name: "小型タンク", detail: "軽量・燃料少なめ", fuel: 5, mass: 4, efficiency: 70, cost: 15 },
    { name: "大型タンク", detail: "大容量・長距離向け", fuel: 10, mass: 8, efficiency: 90, cost: 30 }
  ],
  body: [
    { name: "標準構造", detail: "バランス型", mass: 10, cost: 20 },
    { name: "軽量構造", detail: "軽量・高コスト", mass: 6, cost: 40 }
  ],
  booster: [
    { name: "ブースターなし", detail: "基本構成", thrust: 0, mass: 0, cost: 0 },
    { name: "追加ブースター", detail: "追加推力 400 kN", thrust: 400, mass: 4, cost: 25 }
  ]
};

// 各カテゴリーで最初の部品を初期選択
const selected = {
  engine: 0,
  tank: 0,
  body: 0,
  booster: 0
};

const categoryNames = {
  engine: "engine-options",
  tank: "tank-options",
  body: "body-options",
  booster: "booster-options"
};

const $ = (id) => document.getElementById(id);

// 部品選択ボタンを作る
function renderOptions() {
  for (const category in parts) {
    const container = $(categoryNames[category]);
    container.innerHTML = "";

    parts[category].forEach((part, index) => {
      const button = document.createElement("button");
      button.className =
        "option" + (selected[category] === index ? " selected" : "");

      button.innerHTML = `
        <strong>${part.name}</strong>
        <small>${part.detail}</small>
      `;

      button.setAttribute("aria-pressed", selected[category] === index);

      button.addEventListener("click", () => {
        selected[category] = index;

        // 打ち上げ中なら、いったん通常状態に戻す
        resetLaunch();

        renderOptions();
        updateStats();
      });

      container.appendChild(button);
    });
  }
}

// 選択された部品から性能を計算
function updateStats() {
  const engine = parts.engine[selected.engine];
  const tank = parts.tank[selected.tank];
  const body = parts.body[selected.body];
  const booster = parts.booster[selected.booster];

  const thrust = engine.thrust + booster.thrust;
  const mass = engine.mass + tank.mass + body.mass + booster.mass;

  // 燃料性能はタンクとエンジンの性能を組み合わせた簡易指標
  const efficiency = Math.round(
    (engine.efficiency * 0.6) + (tank.efficiency * 0.4)
  );

  const cost = engine.cost + tank.cost + body.cost + booster.cost;

  // kN / (t × 重力加速度) による簡易的な推力重量比
  const twr = thrust / (mass * 9.81);

  $("thrust").innerHTML = `${thrust.toLocaleString()} <i>kN</i>`;
  $("mass").innerHTML = `${mass} <i>t</i>`;
  $("efficiency").innerHTML = `${efficiency} <i>%</i>`;
  $("cost").innerHTML = `${cost} <i>億円</i>`;
  $("twr").textContent = twr.toFixed(2);

  // グラフ状のバーを更新
  $("thrust-bar").style.width =
    `${Math.min(thrust / 1600 * 100, 100)}%`;

  $("mass-bar").style.width =
    `${Math.min(mass / 30 * 100, 100)}%`;

  $("efficiency-bar").style.width = `${efficiency}%`;

  $("cost-bar").style.width =
    `${Math.min(cost / 200 * 100, 100)}%`;

  // 16通りのうち、現在の組み合わせ番号を計算
  const combination =
    selected.engine * 8 +
    selected.tank * 4 +
    selected.body * 2 +
    selected.booster + 1;

  $("combination-count").textContent =
    `選択中: ${combination} / 16`;

  // ロケットの名前とクラス
  $("rocket-name").textContent =
    `${engine.name === "高出力エンジン" ? "POWER" : "EXPLORER"}-${String(combination).padStart(2, "0")}`;

  $("rocket-class").textContent =
    twr >= 3 ? "HIGH THRUST" : twr >= 1 ? "STANDARD" : "LOW THRUST";

  // ブースターの表示を切り替える
  const rocket = $("rocket");

  rocket.classList.toggle(
    "with-booster",
    selected.booster === 1
  );

  document.querySelectorAll(".booster").forEach((element) => {
    element.style.display =
      selected.booster === 1 ? "block" : "none";
  });

  // タンク容量をオレンジ色の帯で表現
  document.querySelector(".band-two").style.opacity =
    selected.tank === 1 ? "1" : "0.35";

  // 機体構造による外見の違い
  const rocketBody = document.querySelector(".rocket-body");

  rocketBody.style.width = selected.body === 1 ? "46px" : "56px";
  rocketBody.style.left = selected.body === 1 ? "42px" : "37px";

  // エンジン出力によってエンジンの見た目を変更
  document.querySelector(".engine-bell").style.background =
    selected.engine === 1 ? "#ff9b58" : "#8aa9be";

  // 状態メッセージ
  if (twr < 1) {
    $("performance-message").textContent =
      "推力不足の可能性があります";
  } else if (twr < 1.5) {
    $("performance-message").textContent =
      "打ち上げには余裕が少ない構成";
  } else {
    $("performance-message").textContent =
      "初期推力に余裕のある構成";
  }

  $("mission-title").textContent = "打ち上げ準備完了";
  $("mission-message").textContent =
    `推力 ${thrust} kN、機体質量 ${mass} t。設計を確認して打ち上げよう。`;
  $("mission-status").textContent = "STANDBY";
}

// 打ち上げ動作
function launchRocket() {
  const rocket = $("rocket");

  if (rocket.classList.contains("launching")) return;

  const engine = parts.engine[selected.engine];
  const tank = parts.tank[selected.tank];
  const body = parts.body[selected.body];
  const booster = parts.booster[selected.booster];

  const thrust = engine.thrust + booster.thrust;
  const mass = engine.mass + tank.mass + body.mass + booster.mass;
  const twr = thrust / (mass * 9.81);

  if (twr < 1) {
    $("mission-title").textContent = "打ち上げ条件を満たしていません";
    $("mission-message").textContent =
      "推力が機体重量に対して不足しています。部品を変更してみよう。";
    $("mission-status").textContent = "CHECK DESIGN";
    return;
  }

  $("launch-button").disabled = true;
  $("mission-title").textContent = "エンジン点火！";
  $("mission-message").textContent =
    "ロケットが上昇しています。";
  $("mission-status").textContent = "LAUNCH";

  $("altitude").textContent = "上昇中";

  rocket.classList.remove("launching");

  // アニメーションを最初から再生
  void rocket.offsetWidth;
  rocket.classList.add("launching");

  setTimeout(() => {
    $("mission-title").textContent = "打ち上げシーケンス完了";
    $("mission-message").textContent =
      "アニメーションが終了しました。設計を変更して再挑戦できます。";
    $("mission-status").textContent = "COMPLETE";
    $("altitude").textContent = "— km";

    $("launch-button").disabled = false;
  }, 4100);
}

// 打ち上げアニメーションをリセット
function resetLaunch() {
  const rocket = $("rocket");

  rocket.classList.remove("launching");

  $("launch-button").disabled = false;
  $("altitude").textContent = "0 km";
}

// 初期状態に戻す
function resetDesign() {
  selected.engine = 0;
  selected.tank = 0;
  selected.body = 0;
  selected.booster = 0;

  resetLaunch();
  renderOptions();
  updateStats();
}

// ボタンに動作を登録
$("launch-button").addEventListener("click", launchRocket);
$("reset-button").addEventListener("click", resetDesign);

// 初期画面を表示
renderOptions();
updateStats();
