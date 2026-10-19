// Built-in sample portraits for instant testing of Baby-Me Magic

export function createSamplePortrait(type = 'friend') {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');

  // Background
  const bg = ctx.createLinearGradient(0, 0, 600, 600);
  if (type === 'friend') {
    bg.addColorStop(0, '#FFE4EC');
    bg.addColorStop(1, '#D8E2DC');
  } else {
    bg.addColorStop(0, '#E8EAFF');
    bg.addColorStop(1, '#F3E8FF');
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 600, 600);

  // Soft studio light circle
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(300, 260, 220, 0, Math.PI * 2);
  ctx.fill();

  // Shoulders / Clothes
  ctx.fillStyle = type === 'friend' ? '#4A90E2' : '#8E44AD';
  ctx.beginPath();
  ctx.ellipse(300, 560, 200, 120, 0, 0, Math.PI * 2);
  ctx.fill();

  // Neck
  ctx.fillStyle = type === 'friend' ? '#F7D7C4' : '#E0B594';
  ctx.fillRect(260, 360, 80, 80);

  // Face Oval
  ctx.fillStyle = type === 'friend' ? '#FFE0BD' : '#E8BE9B';
  ctx.beginPath();
  ctx.ellipse(300, 290, 120, 140, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hair
  ctx.fillStyle = type === 'friend' ? '#4A3728' : '#2C221E';
  ctx.beginPath();
  ctx.arc(300, 240, 130, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(190, 290, 30, 80, 0, 0, Math.PI * 2);
  ctx.ellipse(410, 290, 30, 80, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyebrows
  ctx.strokeStyle = type === 'friend' ? '#3B2D21' : '#1F1815';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(250, 245, 24, 1.1 * Math.PI, 1.8 * Math.PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(350, 245, 24, 1.2 * Math.PI, 1.9 * Math.PI);
  ctx.stroke();

  // Eyes (White + Iris + Pupil + Glint)
  // Left eye
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(250, 275, 18, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = type === 'friend' ? '#3F51B5' : '#4E342E';
  ctx.beginPath();
  ctx.arc(250, 275, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(250, 275, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(248, 272, 3, 0, Math.PI * 2);
  ctx.fill();

  // Right eye
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.ellipse(350, 275, 18, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = type === 'friend' ? '#3F51B5' : '#4E342E';
  ctx.beginPath();
  ctx.arc(350, 275, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(350, 275, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(348, 272, 3, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.strokeStyle = type === 'friend' ? '#D6A687' : '#B88B69';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(300, 310, 8, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();

  // Cheerful Smile
  ctx.strokeStyle = '#D81B60';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(300, 340, 28, 0.1 * Math.PI, 0.9 * Math.PI);
  ctx.stroke();

  return canvas.toDataURL('image/png');
}
