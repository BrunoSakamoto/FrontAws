import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!image) return;

    const formData = new FormData();
    formData.append('file', image);

    setLoading(true);
    try {
      const response = await axios.post(
        '-------------------', // link do api gateway
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
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
