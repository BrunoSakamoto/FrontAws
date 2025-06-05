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
    if (image.size > 5 * 1024 * 1024) {
      setResult({ error: 'A imagem excede o tamanho máximo de 5MB' });
      return;
    }

    setLoading(true);

    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = async () => {
      const base64Image = reader.result.split(',')[1];

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

        console.log('Resposta bruta:', response.data);

        // Se a resposta tiver um body no formato JSON como string:
        let parsedResult = response.data;
        if (typeof response.data.body === 'string') {
          try {
            parsedResult = JSON.parse(response.data.body);
          } catch (e) {
            console.warn('Falha ao parsear o body:', e);
          }
        }

        console.log('Body parseado:', parsedResult);

        setResult(parsedResult);
      } catch (error) {
        console.error('Erro ao enviar imagem:', error);
        setResult({
          error:
            error.response?.data?.message ||
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
          {result.error && (
            <div className="erro">
              <h3>Erro:</h3>
              <p>{result.error}</p>
            </div>
          )}

          {result.message && <h3>{result.message}</h3>}

          {result.labels && (
            <div className="tags-geradas">
              <h3>Tags Geradas:</h3>
              <ul>
                {result.labels.map((label, index) => (
                  <li key={index}>{label}</li>
                ))}
              </ul>
            </div>
          )}

          {result.mysql_table && (
            <div className="query-realizada">
              <h3>Query Realizada (Dados no MySQL):</h3>
              <table border="1">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>S3 Key</th>
                    <th>Labels</th>
                  </tr>
                </thead>
                <tbody>
                  {result.mysql_table.map((record) => (
                    <tr key={record.id}>
                      <td>{record.id}</td>
                      <td>{record.s3_key}</td>
                      <td>{record.labels.join(', ')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;