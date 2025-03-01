export default function DatasetsPage() {
  return (
    <div className="w-full p-4 flex flex-col space-y-8">
      <h1 className="text-2xl font-bold mb-6">Data Sources</h1>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Deployed Pipelines Data</h2>
        <p className="text-gray-600 leading-relaxed">
          Information about deployed telecommunications pipelines is obtained
          from the Generalitat de Catalunya's Presidency website. This dataset
          provides comprehensive information about existing telecommunications
          infrastructure deployments.
        </p>
        <a
          href="https://presidencia.gencat.cat/ca/ambits_d_actuacio/transformacio-digital/ambits-dactuacio/territori-digital/punt-dinformacio-unic-dacces-a-les-infraestructures-de-telecomunicacions-piu/nous-desplegaments/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline inline-block mt-2"
        >
          Source: Punt d'Informació Únic (PIU) - Nous desplegaments
        </a>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          Empty Pipelines Data (Canalizations)
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Data about empty telecommunications pipelines (canalizations) is
          sourced from the Open Data Catalunya portal. This dataset contains
          information about available telecommunications network channels that
          can be used for future deployments.
        </p>
        <a
          href="https://analisi.transparenciacatalunya.cat/Urbanisme-infraestructures/Canalitzacions-de-xarxes-de-telecomunicacions-de-l/9npv-zyfu/about_data"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline inline-block mt-2"
        >
          Source: Canalitzacions de xarxes de telecomunicacions
        </a>
      </section>
    </div>
  );
}
