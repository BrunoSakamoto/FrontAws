import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); 
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleUpload = async () => {
    if (!image) return;

    setLoading(true);
    try {
      const base64Image = await toBase64(image);

      const response = await axios.post(
        'https://k52y4cvix1.execute-api.us-east-1.amazonaws.com/Stage-1/upload',
        { image: base64Image },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setResult(response.data);
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      setResult({ error: 'Falha na análise' });
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <h1>Análise de Imagem com AWS</h1>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? 'Analisando...' : 'Enviar Imagem'}
      </button>

      {result && (
        <div className="resultado">
          <h3>Resultado:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
