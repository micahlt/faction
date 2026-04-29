const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result || "";
      resolve(result.toString().split(",")[1]);
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default fileToBase64;
