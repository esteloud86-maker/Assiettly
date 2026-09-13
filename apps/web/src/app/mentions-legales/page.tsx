import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Mentions légales — Assiettly",
};

export default function MentionsLegalesPage() {
  return (
    <LegalLayout titre="Mentions légales" misAJourLe="13 septembre 2026">
      <section>
        <h2>1. Éditeur du site</h2>
        <p>Le site et l&rsquo;application Assiettly (ci-après &laquo;&nbsp;Assiettly&nbsp;&raquo;) sont édités par&nbsp;:</p>
        <ul>
          <li>
            <strong>Raison sociale / forme juridique</strong>&nbsp;: [À compléter : raison sociale / forme
            juridique]
          </li>
          <li>
            <strong>Siège social</strong>&nbsp;: [À compléter : adresse du siège]
          </li>
          <li>
            <strong>SIRET</strong>&nbsp;: [À compléter : SIRET]
          </li>
          <li>
            <strong>Numéro de TVA intracommunautaire</strong>&nbsp;: [À compléter : numéro de TVA
            intracommunautaire]
          </li>
          <li>
            <strong>Capital social</strong>&nbsp;: [À compléter : capital social, si applicable]
          </li>
          <li>
            <strong>Contact</strong>&nbsp;:{" "}
            <a href="mailto:contact@assiettly.fr">contact@assiettly.fr</a>
          </li>
        </ul>
      </section>

      <section>
        <h2>2. Directeur de la publication</h2>
        <p>
          Le directeur ou la directrice de la publication est [À compléter : nom du directeur de publication], en
          sa qualité de représentant légal de l&rsquo;éditeur mentionné ci-dessus.
        </p>
      </section>

      <section>
        <h2>3. Hébergement</h2>
        <p>Assiettly repose sur deux hébergeurs distincts, chacun responsable d&rsquo;une partie de l&rsquo;infrastructure&nbsp;:</p>
        <ul>
          <li>
            <strong>Application web</strong> — hébergée par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789,
            États-Unis (
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">
              vercel.com
            </a>
            ).
          </li>
          <li>
            <strong>Base de données</strong> — les données des utilisateurs sont hébergées par Supabase Inc., sur
            un projet dont la région d&rsquo;hébergement est configurée en <strong>eu-west-3 (Paris, France)</strong>{" "}
            (<a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a>).
          </li>
        </ul>
        <p>
          Pour plus de détails sur la localisation et le traitement des données personnelles, voir la{" "}
          <a href="/confidentialite">politique de confidentialité</a>.
        </p>
      </section>

      <section>
        <h2>4. Propriété intellectuelle</h2>
        <p>
          L&rsquo;ensemble des éléments composant Assiettly (textes, structure, base de données, charte graphique,
          logo, icônes, code source, contenus rédactionnels) est protégé par le droit de la propriété
          intellectuelle et reste la propriété exclusive de l&rsquo;éditeur, sauf mentions contraires. Toute
          reproduction, représentation, modification, publication ou adaptation de tout ou partie de ces éléments,
          quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable de
          l&rsquo;éditeur.
        </p>
        <p>
          Les données nutritionnelles de la base Open Food Facts, utilisées pour le scan de codes-barres, restent
          la propriété de leurs contributeurs respectifs et sont mises à disposition sous licence libre par la
          communauté Open Food Facts (<a href="https://world.openfoodfacts.org" target="_blank" rel="noopener noreferrer">openfoodfacts.org</a>), indépendante d&rsquo;Assiettly.
        </p>
      </section>

      <section>
        <h2>5. Limitation de responsabilité</h2>
        <p>
          Assiettly met tout en œuvre pour fournir des informations et des estimations aussi fiables que possible
          (calcul de besoins caloriques, analyse de repas par intelligence artificielle, données issues de bases
          externes), sans pouvoir garantir l&rsquo;exactitude, l&rsquo;exhaustivité ou l&rsquo;actualité de ces
          informations. Ces éléments sont fournis à titre indicatif et ne sauraient se substituer à un avis
          médical, diététique ou nutritionnel professionnel (voir la section &laquo;&nbsp;Avertissement santé&nbsp;&raquo;
          des <a href="/cgu">conditions générales d&rsquo;utilisation</a>).
        </p>
        <p>
          L&rsquo;éditeur ne pourra être tenu responsable des dommages directs ou indirects résultant de
          l&rsquo;utilisation du service, d&rsquo;une interruption temporaire d&rsquo;accès, ou de décisions prises
          par l&rsquo;utilisateur sur la base des informations fournies par l&rsquo;application.
        </p>
      </section>

      <section>
        <h2>6. Contact</h2>
        <p>
          Pour toute question relative aux présentes mentions légales, tu peux nous écrire à{" "}
          <a href="mailto:contact@assiettly.fr">contact@assiettly.fr</a>.
        </p>
      </section>
    </LegalLayout>
  );
}
