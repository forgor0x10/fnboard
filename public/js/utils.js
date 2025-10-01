export function renderMessageHTML(message) {
  const date = new Date(message.timestamp);

  const dateString = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  const senderString = escapeHTML(message.sender);
  const contentString = escapeHTML(message.content);

  const tripcodeString = message.tripcode
    ? `<span class="dim">::</span>${message.tripcode}`
    : "";

  return `<div>${dateString}
               <span class="dim"> » </span>
               ${senderString}${tripcodeString}
               <span class="dim"> » </span>
               ${contentString}</div>`;
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
