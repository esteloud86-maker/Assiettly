import type { Metadata } from "next";
import { LegalLayout } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Assiettly",
};

export default function ConfidentialitePage() {
  return (
    <LegalLayout titre="Politique de confidentialité" misAJourLe="13 septembre 2026">
      <section>
        <h2>1. Responsable du traitement</h2>
        <p>
          Le responsable du traitement des données personnelles collectées via Assiettly est [À compléter :
          raison sociale / forme juridique], [À compléter : adresse du siège] (voir les{" "}
          <a href="/mentions-legales">mentions légales</a>). Pour toute question relative à tes données
          personnelles, tu peux nous contacter à{" "}
          <a href="mailto:contact@assiettly.fr">contact@assiettly.fr</a>.
        </p>
      </section>

      <section>
        <h2>2. Données collectées</h2>
        <p>Nous collectons les catégories de données suivantes&nbsp;:</p>
        <ul>
          <li>
            <strong>Données de compte</strong>&nbsp;: adresse e-mail, mot de passe (stocké de façon sécurisée via
            Supabase Auth), nom facultatif.
          </li>
          <li>
            <strong>Données de profil et d&rsquo;onboarding</strong>&nbsp;: sexe, date de naissance, taille, poids,
            poids cible, niveau d&rsquo;activité, objectif (perte, maintien, prise de poids), préférences
            alimentaires, motivation principale, suivi ou non par un·e coach/diététicien·ne.
          </li>
          <li>
            <strong>Données de suivi</strong>&nbsp;: repas enregistrés (manuellement, par code-barres ou par
            photo), historique de poids, historique de flamme/streak.
          </li>
          <li>
            <strong>Photos de repas</strong>&nbsp;: lorsque tu utilises le scan par photo, l&rsquo;image est
            transmise à l&rsquo;API d&rsquo;Anthropic pour analyse. Le résultat de l&rsquo;analyse (aliments
            estimés, quantités, valeurs nutritionnelles) est conservé dans ton journal ; à ce jour,
            l&rsquo;image elle-même n&rsquo;est pas stockée de façon persistante par nos serveurs — elle
            n&rsquo;est conservée que quelques minutes dans un cache technique temporaire destiné à éviter un
            double traitement en cas de nouvelle soumission rapprochée, avant d&rsquo;être automatiquement
            effacée.
          </li>
          <li>
            <strong>Données de paiement</strong>&nbsp;: gérées directement par Stripe pour les abonnements
            Premium ; Assiettly ne stocke pas tes coordonnées bancaires.
          </li>
          <li>
            <strong>Données techniques</strong>&nbsp;: abonnement aux notifications push (si activées), journal
            technique des appels d&rsquo;analyse de repas (modèle utilisé, niveau de confiance, durée, erreur
            éventuelle — sans l&rsquo;image).
          </li>
        </ul>
        <p>
          <strong>
            Attention : certaines de ces données (poids, objectifs de poids, préférences alimentaires, repas)
            peuvent être qualifiées de données de santé au sens de l&rsquo;article 9 du RGPD.
          </strong>{" "}
          Ces données bénéficient d&rsquo;une protection renforcée et ne sont traitées qu&rsquo;avec ton
          consentement explicite, recueilli lors de l&rsquo;onboarding.
        </p>
      </section>

      <section>
        <h2>3. Finalités du traitement</h2>
        <ul>
          <li>fournir le Service (journal alimentaire, calcul d&rsquo;objectifs, flamme, historique)&nbsp;;</li>
          <li>
            analyser les photos de repas pour estimer leur contenu nutritionnel (fonctionnalité de scan par
            photo)&nbsp;;
          </li>
          <li>gérer ton compte, ton abonnement et les paiements associés&nbsp;;</li>
          <li>t&rsquo;envoyer des e-mails transactionnels (bienvenue) et des rappels de flamme, ainsi que des notifications push si tu les as activées&nbsp;;</li>
          <li>assurer la sécurité, la maintenance et l&rsquo;amélioration du Service.</li>
        </ul>
      </section>

      <section>
        <h2>4. Base légale</h2>
        <ul>
          <li>
            <strong>Exécution du contrat</strong>&nbsp;: pour les traitements nécessaires au fonctionnement du
            Service (compte, journal, abonnement, e-mails transactionnels).
          </li>
          <li>
            <strong>Consentement explicite</strong>&nbsp;: pour les données assimilables à des données de santé
            (poids, objectifs, préférences alimentaires) et pour l&rsquo;envoi de photos de repas à un service
            tiers d&rsquo;analyse par IA. Ce consentement peut être retiré à tout moment, notamment en supprimant
            ton compte.
          </li>
          <li>
            <strong>Intérêt légitime</strong>&nbsp;: pour la sécurité du Service et la prévention des abus.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Destinataires des données</h2>
        <p>
          Tes données ne sont jamais vendues. Elles peuvent être transmises aux sous-traitants suivants, dans la
          stricte mesure nécessaire à la fourniture du Service&nbsp;:
        </p>
        <ul>
          <li>
            <strong>Supabase</strong> (base de données et authentification) — hébergement en Union européenne,
            région eu-west-3 (Paris, France).
          </li>
          <li>
            <strong>Stripe</strong> (traitement des paiements et gestion des abonnements) — reçoit les
            informations nécessaires à la facturation, à l&rsquo;exclusion des données de suivi nutritionnel.
          </li>
          <li>
            <strong>Resend</strong> (envoi des e-mails transactionnels et de rappel) — reçoit ton adresse e-mail
            et les informations nécessaires à la personnalisation du message (prénom, streak en cours).
          </li>
          <li>
            <strong>Anthropic</strong> (analyse des photos de repas par intelligence artificielle) — société
            basée aux États-Unis. Le transfert d&rsquo;une photo de repas hors de l&rsquo;Union européenne
            constitue un transfert de données vers un pays tiers ; un tel transfert doit être encadré par des
            garanties appropriées, telles que les clauses contractuelles types de la Commission européenne. Nous
            nous engageons à vérifier et documenter la mise en place de ces garanties auprès d&rsquo;Anthropic, et
            à ne recourir qu&rsquo;à un traitement limité au strict nécessaire (estimation nutritionnelle, sans
            conservation de l&rsquo;image par nos soins au-delà du cache technique décrit à l&rsquo;article 2).
          </li>
          <li>
            <strong>Vercel</strong> (hébergement de l&rsquo;application) — voir les{" "}
            <a href="/mentions-legales">mentions légales</a>.
          </li>
        </ul>
      </section>

      <section>
        <h2>6. Durée de conservation</h2>
        <p>
          Tes données sont conservées tant que ton compte est actif. En cas de suppression de compte, tes données
          personnelles sont supprimées ou anonymisées dans un délai raisonnable, sous réserve des données que nous
          devons conserver plus longtemps pour répondre à une obligation légale (par exemple, les données de
          facturation conservées le temps requis par la réglementation comptable et fiscale). Les images de repas
          transmises pour analyse ne sont, quant à elles, conservées que quelques minutes au maximum dans le cache
          technique décrit à l&rsquo;article 2.
        </p>
      </section>

      <section>
        <h2>7. Tes droits</h2>
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et
          Libertés, tu disposes des droits suivants sur tes données personnelles&nbsp;: accès, rectification,
          effacement, limitation, portabilité et opposition.
        </p>
        <ul>
          <li>
            <strong>Export de tes données</strong>&nbsp;: directement depuis la page{" "}
            <em>Profil</em> de l&rsquo;application, un bouton &laquo;&nbsp;Exporter mes données&nbsp;&raquo; te
            permet de télécharger l&rsquo;ensemble de tes données personnelles au format JSON, à tout moment.
          </li>
          <li>
            <strong>Suppression de ton compte</strong>&nbsp;: directement depuis la page <em>Profil</em>, un
            bouton &laquo;&nbsp;Supprimer mon compte&nbsp;&raquo; (avec confirmation explicite) supprime
            définitivement ton profil, tes repas, ton historique de poids, ta série et ton abonnement en cours.
          </li>
          <li>
            Pour exercer l&rsquo;un de ces droits, écris-nous à{" "}
            <a href="mailto:contact@assiettly.fr">contact@assiettly.fr</a>. Nous répondons dans un délai maximum
            d&rsquo;un mois, conformément au RGPD.
          </li>
          <li>
            Si tu estimes que tes droits ne sont pas respectés, tu peux introduire une réclamation auprès de la
            Commission Nationale de l&rsquo;Informatique et des Libertés (CNIL) —{" "}
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
              www.cnil.fr
            </a>
            .
          </li>
        </ul>
      </section>

      <section>
        <h2>8. Sécurité</h2>
        <p>
          Nous mettons en œuvre des mesures techniques et organisationnelles raisonnables pour protéger tes
          données (chiffrement des mots de passe, connexions HTTPS, accès restreint aux données de production).
          Aucun système n&rsquo;étant infaillible, nous ne pouvons toutefois garantir une sécurité absolue.
        </p>
      </section>

      <section>
        <h2>9. Cookies et traceurs</h2>
        <p>
          Assiettly n&rsquo;utilise, à ce jour, aucun cookie ou traceur publicitaire, ni aucun outil d&rsquo;analyse
          d&rsquo;audience tiers (pas de Google Analytics, Meta Pixel ou équivalent). Seuls des cookies et
          mécanismes de stockage strictement nécessaires au fonctionnement du Service sont utilisés (maintien de
          ta session de connexion, préférences locales de l&rsquo;application). Si cela venait à évoluer, cette
          politique serait mise à jour en conséquence et un dispositif de consentement adapté serait mis en place
          si requis par la réglementation.
        </p>
      </section>

      <section>
        <h2>10. Modification de cette politique</h2>
        <p>
          Cette politique de confidentialité peut être mise à jour, notamment pour refléter une évolution du
          Service, de nos sous-traitants ou de la réglementation applicable. La date de dernière mise à jour
          figure en haut de cette page.
        </p>
      </section>
    </LegalLayout>
  );
}
