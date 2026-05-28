import Footer from './components/Layout/Footer.jsx';
import Header from './components/Layout/Header.jsx';
import PcapUploader from './components/Upload/PcapUploader.jsx';
import CaptureSummary from './components/Capture/CaptureSummary.jsx';
import { UploadStatus, useUploadState } from './features/capture/useUploadState.js';
import './App.css';

function App() {
  const { status, data, error, filename, upload, reset } = useUploadState();
  const isParsed = status === UploadStatus.PARSED;
  return (
    <div className="app-shell">
      <Header />
      <main className="main">
        <div className="container main__inner">
          {isParsed ? (
            <CaptureSummary data={data} onReset={reset} />
          ) : (
            <div className="landing">
              <section className="hero">
                <span className="eyebrow">Audio-visual network capture analysis</span>
                <h1 className="hero__title">
                  Traficul de rețea <em>auzit</em> și <em>văzut</em>, nu doar urmărit.
                </h1>
                <p className="hero__lede">
                Un instrument experimental care transformă traficul de rețea într-o reprezentare audio-vizuală sincronizată, pentru detectarea traficului malițios (DoS & Port Scanning).
                </p>
              </section>
              <PcapUploader
                status={status}
                error={error}
                filename={filename}
                onUpload={upload}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
export default App;
