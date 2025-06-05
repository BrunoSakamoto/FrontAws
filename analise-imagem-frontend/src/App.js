import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!image) {
      setResult({ error: 'Nenhuma imagem selecionada' });
      return;
    }

    // Validação de tipo e tamanho
    if (!['image/jpeg', 'image/png'].includes(image.type)) {
      setResult({ error: 'Apenas imagens JPEG ou PNG são permitidas' });
      return;
    }
    if (image.size > 5 * 1024 * 1024) { // Limite de 5MB
      setResult({ error: 'A imagem excede o tamanho máximo de 5MB' });
      return;
    }

    setLoading(true);

    // Converter a imagem para Base64
    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = async () => {
      const base64Image = reader.result.split(',')[1]; // Remove o prefixo

      try {
        const response = await axios.post(
          'https://k52y4cvix1.execute-api.us-east-1.amazonaws.com/Stage-1/upload',
          {
            image_data: base64Image,
            filename: image.name,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        setResult(response.data);
      } catch (error) {
        console.error('Erro ao enviar imagem:', error);
        setResult({
          error: error.response?.data?.message ||
            error.message ||
            'Falha ao enviar a imagem. Verifique o console para mais detalhes.',
        });
      }
      setLoading(false);
    };

    reader.onerror = () => {
      console.error('Erro ao converter imagem para Base64');
      setResult({ error: 'Erro ao processar a imagem' });
      setLoading(false);
    };
  };

  return (
    <div className="App">
      <h1>Análise de Imagem com AWS</h1>

      <div className="upload-container">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button onClick={handleUpload} disabled={loading}>
          {loading ? 'Analisando...' : 'Enviar Imagem'}
        </button>
      </div>
      
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