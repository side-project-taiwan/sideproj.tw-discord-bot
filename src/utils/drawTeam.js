const { createCanvas, loadImage, registerFont } = require("canvas");
const crownUrl = "https://cdn-icons-png.flaticon.com/512/2583/2583344.png";

// Register Font
registerFont('./fonts/Cubic_11.ttf', { family: 'Cubic11' });

async function generateCheckInImage(teamInfo, teamSize) {
  const cardWidth = 150;
  const cardHeight = 170;
  const padding = 20;
  const columns = Math.min(5, teamInfo.length);
  const rows = Math.ceil(teamInfo.length / columns);

  const canvasWidth = 5 * cardWidth + padding * 2;
  const canvasHeight = rows * cardHeight + padding * 2 + 40;

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  // Find SP King
  const spKing = teamInfo.reduce((maxUser, curr) => {
    if (!maxUser) return curr;
    if (curr.level > maxUser.level) return curr;
    if (curr.level === maxUser.level && curr.spExp > maxUser.spExp) return curr;
    return maxUser;
  }, null);

  // Read Crown Image
  let crownImage = null;
  try {
    crownImage = await loadImage(crownUrl);
  } catch (e) {
    console.warn("error to load crown image");
  }

  // Background
  const bgGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  bgGradient.addColorStop(0, "#1e1e2e");
  bgGradient.addColorStop(1, "#2a2a3d");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Title
  ctx.fillStyle = "#00ccff";
  ctx.font = "20px Cubic11";
  ctx.textAlign = "left";
  ctx.fillText("Side Project Taiwan - SP Team", padding, 28);
  ctx.fillText(`Team Members: ${teamSize}`, padding, 50);

  ctx.textAlign = "center";

  for (let i = 0; i < teamInfo.length; i++) {
    const user = teamInfo[i];
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x = padding + col * cardWidth + (cardWidth - 140) / 2;
    const y = padding + row * cardHeight + 40;

    // Card Background
    if (user.userId === spKing.userId) {
      ctx.fillStyle = "#5a3e2b";
    } else {
      ctx.fillStyle = "#333";
    }
    ctx.fillRect(x, y, 140, 160);

    // Border
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 140, 160);

    // SP King Light
    if (user.userId === spKing.userId) {
      const glowGradient = ctx.createRadialGradient(x + 70, y + 45, 10, x + 70, y + 45, 40);
      glowGradient.addColorStop(0, "rgba(255, 223, 0, 0.6)");
      glowGradient.addColorStop(1, "rgba(255, 223, 0, 0)");
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(x + 70, y + 45, 40, 0, Math.PI * 2);
      ctx.fill();
    }

    // Avatar
    try {
      const avatar = await loadImage(user.avatar);
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + 70, y + 45, 30, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, x + 40, y + 15, 60, 60);
      ctx.restore();
    } catch (err) {
      ctx.fillStyle = "#666";
      ctx.beginPath();
      ctx.arc(x + 70, y + 45, 30, 0, Math.PI * 2);
      ctx.fill();
    }

    // Leader Crown Image
    if (i === 0 && crownImage) {
      ctx.drawImage(crownImage, x + 95, y + 5, 24, 24);
    }

    // Name
    ctx.fillStyle = "#ffffff";
    ctx.font = "15px Cubic11";
    ctx.fillText(user.name, x + 70, y + 100);

    // SP Level
    ctx.font = "15px Cubic11";
    ctx.fillStyle = "#bbbbbb";
    ctx.fillText(`Lv.${user.level}`, x + 70, y + 120);

    // SP Exp
    ctx.fillStyle = "#00ccff";
    ctx.fillText(`${user.spExp} SP`, x + 70, y + 140);

    // SP Exp Bar
    const progressWidth = 100;
    const barX = x + 70 - progressWidth / 2;
    const barY = y + 150;
    const ratio = Math.min(user.spExp / 20000, 1);

    ctx.fillStyle = "#444";
    ctx.fillRect(barX, barY, progressWidth, 8);

    ctx.fillStyle = "#ffd700";
    ctx.fillRect(barX, barY, progressWidth * ratio, 8);

    ctx.font = "12px Cubic11";
    ctx.fillStyle = "#888";
    ctx.fillText(`${user.spExp}/20000`, x + 70, barY + 18);
  }

  return canvas.toBuffer("image/png");
};


async function drawSpRanking(teamInfo, text = 'all') {
  const cardWidth = 420;
  const cardHeight = 80;
  const padding = 20;
  const spacing = 10;
  const titleHeight = 40;
  const minVisibleRows = 5;
  const visibleRows = Math.max(teamInfo.length, minVisibleRows);
  const canvasWidth = cardWidth + padding * 2;
  const canvasHeight = titleHeight + visibleRows * (cardHeight + spacing) + padding;
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  // Background
  const bgGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  bgGradient.addColorStop(0, "#1e1e2e");
  bgGradient.addColorStop(1, "#2a2a3d");
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Title
  ctx.font = "20px Cubic11";
  ctx.fillStyle = "#00ccff";
  ctx.textBaseline = "top";
  ctx.fillText(`[${text}] SP Ranking`, padding, padding);

  // Draw
  const offsetY = padding + titleHeight;

  for (let i = 0; i < teamInfo.length; i++) {
    const user = teamInfo[i];
    const x = padding;
    const y = offsetY + i * (cardHeight + spacing);

    ctx.font = "15px Cubic11";

    // Card Background
    ctx.fillStyle = "#333";
    ctx.fillRect(x, y, cardWidth, cardHeight);
    ctx.strokeStyle = "#888";
    ctx.strokeRect(x, y, cardWidth, cardHeight);

    // Rank Glow
    const glowX = x + 35;
    const glowY = y + 45;
    let glowColor = null;

    if (user.userId === teamInfo[0]?.userId) {
      glowColor = "rgba(255, 215, 0"; // SP King Gold
    } else if (user.userId === teamInfo[1]?.userId) {
      glowColor = "rgba(192, 192, 192"; // SP 2nd Silver
    } else if (user.userId === teamInfo[2]?.userId) {
      glowColor = "rgba(205, 127, 50"; // SP 3rd Bronze
    }

    if (glowColor) {
      const glowGradient = ctx.createRadialGradient(glowX, glowY, 10, glowX, glowY, 40);
      glowGradient.addColorStop(0, `${glowColor}, 0.6)`);
      glowGradient.addColorStop(1, `${glowColor}, 0)`);
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(glowX, glowY, 40, 0, Math.PI * 2);
      ctx.fill();
    }

    // Avatar
    try {
      const avatar = await loadImage(user.avatar);
      ctx.save();
      ctx.beginPath();
      ctx.arc(x + 35, y + 40, 25, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, x + 10, y + 15, 50, 50);
      ctx.restore();
    } catch {
      ctx.fillStyle = "#666";
      ctx.beginPath();
      ctx.arc(x + 35, y + 40, 25, 0, Math.PI * 2);
      ctx.fill();
    }

    // Info Location
    const baseX = x + 75;
    const topY = y + 20;

    ctx.fillStyle = "#fff";
    ctx.fillText(user.name, baseX, topY);

    ctx.fillStyle = "#bbb";
    ctx.fillText(`Lv.${user.level}`, baseX + 100, topY);

    // SP Text - two parts with color separation
    ctx.font = "15px Cubic11";
    ctx.textAlign = "left";
    if (user.gainExp != null) {
      const mainExpText = `${user.spExp - user.gainExp}`;
      const gainText = ` + ${user.gainExp} SP`;

      ctx.fillStyle = "#ffd700"; // gold
      ctx.fillText(mainExpText, baseX + 200, topY);
      const mainTextWidth = ctx.measureText(mainExpText).width;

      ctx.fillStyle = "#00ccff"; // blue
      ctx.fillText(gainText, baseX + 200 + mainTextWidth, topY);
    } else {
      ctx.fillStyle = "#00ccff";
      ctx.fillText(`${user.spExp} SP`, baseX + 200, topY);
    }

    const barX = baseX + 200;
    const barY = y + 40;
    const progressWidth = 100;

    // Base bar
    ctx.fillStyle = "#444";
    ctx.fillRect(barX, barY, progressWidth, 10);

    // Old progress
    const oldRatio = Math.min((user.spExp - (user.gainExp ?? 0)) / 20000, 1);
    const oldBarWidth = Math.max(progressWidth * oldRatio, 0);
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(barX, barY, oldBarWidth, 10);

    // Gain progress
    if (user.gainExp != null) {
      const totalRatio = Math.min(user.spExp / 20000, 1);
      const totalBarWidth = Math.max(progressWidth * totalRatio, 0);
      const gainBarWidth = Math.max(totalBarWidth - oldBarWidth, 0);
      ctx.fillStyle = "#00ccff";
      ctx.fillRect(barX + oldBarWidth, barY, gainBarWidth, 10);
    }

    // Show exp progress value centered and closer to the bar
    ctx.fillStyle = "#888";
    ctx.font = "12px Cubic11";
    ctx.textAlign = "center";
    ctx.fillText(`${user.spExp}/20000`, barX + progressWidth / 2, barY + 11);
    ctx.textAlign = "left";
  }

  return canvas.toBuffer("image/png");
}

module.exports = {
  generateCheckInImage,
  drawSpRanking,
};
