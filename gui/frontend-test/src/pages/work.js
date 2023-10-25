// When the parent theard requires it, render the HTML
self.addEventListener("message", ({ data }) => {
  const result = "hello";
  self.postMessage(result);
});
