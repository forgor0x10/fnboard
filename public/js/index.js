document.addEventListener("DOMContentLoaded", () => {
  const goButtonElement = document.getElementById("go-button");
  const channelInputElement = document.getElementById("channel-input");

  goButtonElement.addEventListener("click", () => {
    const channelName = channelInputElement.value;

    if (!channelName) {
      alert("Channel name cannot be empty");
      return;
    }

    window.location.href = `/channel/${channelName}`;
  });
});
