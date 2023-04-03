import { Experiment, isURLTargeted, Result } from "@growthbook/growthbook";
import { useGrowthBook } from "@growthbook/growthbook-react";
import qs from "qs";

const activeExperimentVariations = new Map();

export const onExperimentViewed = (
  experiment: Experiment<any>,
  result: Result<any>
) => {
  const experimentId = experiment.key;
  const variationId = result.key;

  console.log("Viewed Experiment", {
    experimentId,
    variationId,
  });

  activeExperimentVariations.set(experimentId, variationId);
};

const genPreviewLink = ({ name, i }: { name: string; i: number }) => {
  const [root] = window.location.href.split("?");
  return `${root}?${qs.stringify({ [name]: i })}`;
};

export default function VisualExperimentsDisplay() {
  const gb = useGrowthBook();
  const experiments = gb?.getExperiments();

  if (!experiments?.length) {
    return <h3>No Visual Experiments found.</h3>;
  }

  return (
    <>
      <h3>Visual experiments:</h3>
      <ul>
        {experiments.map((e, i) => (
          <li key={i}>
            {e.name} ({e.status})
            <ul>
              <li>
                Active?{" "}
                <strong>
                  {activeExperimentVariations.has(e.key)
                    ? `Variation ${activeExperimentVariations.get(e.key)}`
                    : "false"}
                </strong>
              </li>
              <li>
                URL Targets
                <ul>
                  {e?.urlPatterns?.map((p, i) => (
                    <li key={i}>
                      <table border={1} cellPadding={4}>
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Pattern</th>
                            <th>Include?</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>{p.type}</td>
                            <td>{p.pattern}</td>
                            <td>{p.include ? "true" : "false"}</td>
                          </tr>
                        </tbody>
                      </table>
                    </li>
                  ))}
                </ul>
              </li>

              {isURLTargeted(window.location.href, e.urlPatterns ?? []) && (
                <li>
                  Preview links
                  <ul>
                    {e.variations.map(
                      (_v, i) =>
                        e.name && (
                          <li key={i}>
                            <a href={genPreviewLink({ name: e.name, i })}>
                              {genPreviewLink({ name: e.name, i })}
                            </a>
                          </li>
                        )
                    )}
                  </ul>
                </li>
              )}
            </ul>
          </li>
        ))}
      </ul>
      <p>
        To see preview links, add URL targets to your experiment that target the
        current URL ({window.location.href.split("?")[0]}).
      </p>
    </>
  );
}
