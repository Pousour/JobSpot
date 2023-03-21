document.addEventListener("DOMContentLoaded", function (event) {
  const textToken = document.querySelector("#checkTokenMessage");
  const buttonSearch = document.querySelector("#searchJobs");
  const searchText = document.querySelector("#searchResults");

  const regex = /https?:\/\/[\w\-\.]+\.[\w\-]+\/[\w\-\.\/\?\%\&\=]*/gi;

  buttonSearch.addEventListener("click", async () => {
    const temp = tags1;
    const motsCles = temp.join(",");
    let communes = "";

    for (i = 0; i < tags2.length; i++) {
      if (tags2.length == 1 || i == tags2.length - 1) communes += tags2[i].code;
      else communes += tags2[i].code + ",";
    }
    const response = await fetch(
      "/server/searchJobs?motsCles=" + motsCles + "&commune=" + communes
    );
    const data = await response.json();
    const offres = data.resultats;
    if (!offres) {
      searchText.innerHTML = "0 offre trouvée";
      return;
    }
    searchText.innerHTML = "";
    offres.forEach((offre) => {
      ///////////////
      /*           console.log(offre) */
      ///////////////

      const divOffre = document.createElement("div");
      const titreOffre = document.createElement("h4");
      const descOffre = document.createElement("p");
      const sousTitre = document.createElement("div");
      const lieuOffre = document.createElement("p");
      const nomEntreprise = document.createElement("p");
      const footerOffre = document.createElement("div");
      const salaireOffre = document.createElement("p");
      const lienOffre = document.createElement("a");
      const iconLienOffre = document.createElement("i");

      divOffre.classList.add("divOffre");
      titreOffre.classList.add("titreOffre");
      descOffre.classList.add("descOffre");
      sousTitre.classList.add("sousTitre");
      lieuOffre.classList.add("lieuOffre");
      nomEntreprise.classList.add("nomEntreprise");
      salaireOffre.classList.add("salaireOffre");
      lienOffre.classList.add("lienOffre");

      lienOffre.append(iconLienOffre);

      // Utilisation de la fonction getTextOrDefault pour chaque élément de l'offre
      titreOffre.textContent = getTextOrDefault(offre.intitule, "pas indiqué");
      descOffre.textContent = getTextOrDefault(
        offre.description,
        "pas indiqué"
      );
      lieuOffre.textContent = getTextOrDefault(
        offre.lieuTravail.libelle,
        "pas indiqué"
      );
      nomEntreprise.textContent = getTextOrDefault(offre.entreprise.nom, "");
      sousTitre.classList.add("sousTitre");
      sousTitre.innerHTML =
        "<span class='nomEntreprise'> " +
        nomEntreprise.innerText +
        "</span> - <span>" +
        lieuOffre.innerText +
        "</span>";

      if (
        !offre.salaire ||
        (!offre.salaire.libelle && !offre.salaire.commentaire)
      )
        salaireOffre.textContent = "Salaire: pas indiqué";
      else if (offre.salaire.libelle) {
        const temp = offre.salaire.libelle;
        let nombres = temp.match(/\d+(?:,\d+)?(?=\s+Euros)/g);
        salaireOffre.textContent = "Salaire: ";
        nombres.forEach((nombre) => {
          salaireOffre.textContent += nombre + "€";
          if (nombres.indexOf(nombre) != nombres.length - 1)
            salaireOffre.textContent += " à ";
          if (nombres.indexOf(nombre) == nombres.length - 1) {
            if (temp.startsWith("Horaire"))
              salaireOffre.textContent += " /heure";
            else if (temp.startsWith("Mensuel"))
              salaireOffre.textContent += " /mois";
            else if (temp.startsWith("Annuel"))
              salaireOffre.textContent += " /an";
          }
        });
      } else if (offre.salaire.commentaire)
        salaireOffre.textContent = "Salaire: " + offre.salaire.commentaire;

      iconLienOffre.ariaHidden = "true";

      // Lien de l'offre
      if (offre.contact && offre.contact.coordonnees1) {
        iconLienOffre.classList.add("fa", "fa-external-link", "fa-lg");
        const lienUrl = offre.contact.coordonnees1.match(regex);
        lienOffre.href = lienUrl;
        lienOffre.target = "_blank";
      } else iconLienOffre.classList.add("fa", "fa-chain-broken", "fa-lg");

      footerOffre.classList.add("footerOffre");
      footerOffre.append(salaireOffre, lienOffre);

      divOffre.append(titreOffre, sousTitre, descOffre, footerOffre);
      searchText.append(divOffre);
    });
  });

  function getTextOrDefault(text, defaultValue) {
    return text || text === null || text === "" ? text : defaultValue;
  }

  // TAGS

  const input1 = document.querySelector("#tag-input-keyword");
  const input2 = document.querySelector("#tag-input-place");

  const tagsContainer1 = document.querySelector(".tags-keyword");
  const tagsContainer2 = document.querySelector(".tags-place");

  let tags1 = [];
  let tags2 = [];

  // Ajout d'un événement à l'appui de la touche "Enter" dans l'Input Field 1
  input1.addEventListener("keyup", function (e) {
    if (e.key === "Enter" && input1.value !== "") {
      let temp = input1.value.split(" ");
      if (tags1.length == 0)
        document.getElementsByClassName("tags-keyword")[0].style.padding =
          "0 0 8px 8px";

      temp.forEach((tag) => {
        addKeywordTag(tag);
      });
      input1.value = "";
    }
  });

  function addKeywordTag(tag) {
    // Ajout du tag dans le tableau tags1
    tags1.push(tag.trim());

    // Création d'un élément div pour le tag et ajout à la div tagsContainer1
    const tagEl = document.createElement("div");
    tagEl.classList.add("tag");
    tagEl.innerHTML = `${tag.trim()} <i class="fa fa-times-circle" aria-hidden="true"></i>`;
    tagEl.querySelector("i").addEventListener("click", (e) => {
      // Suppression du tag dans le tableau tags1 et dans la div tagsContainer1
      let temp = [];
      let tagText = e.target.parentElement.innerText;

      for (i = 0; i < tags1.length; i++) {
        if (tags1[i] != tagText) {
          temp.push(
            e.target.parentElement.parentElement.querySelectorAll(".tag")[i]
              .innerText
          );
        }
      }
      tags1 = temp;
      e.target.parentElement.remove();
      if (tags1.length == 0)
        document.getElementsByClassName("tags-keyword")[0].style.padding = "0";
    });
    tagsContainer1.appendChild(tagEl);
    tag.value = "";
  }

  // GESTION DES TAGS DE LIEUX

  input2.addEventListener("keyup", async () => {
    let nom = input2.value;
    if (nom.length < 3) {
      suggestions.innerHTML = "";
      document.getElementById("suggestions").style.display = "none";

      return;
    } else document.getElementById("suggestions").style.display = "block";

    let url;

    // 0 = nom, 1 = codePostal
    let nomOuCode;

    if (isNaN(nom)) {
      url = `https://geo.api.gouv.fr/communes?nom=${nom}&fields=departement&boost=population&limit=5'`;
    } else {
      if (nom.length == 2) {
        url = `https://geo.api.gouv.fr/departements/${nom}/communes?boost=population&limit=5`;
        nomOuCode = 0;
      } else {
        while (nom.length != 5) {
          nom += "0";
        }
        url = `https://geo.api.gouv.fr/communes?codePostal=${nom}&boost=population&limit=5`;
        nomOuCode = 1;
      }
    }
    const response = await fetch(url);
    const lieux = await response.json();
    suggestions.innerHTML = "";
    lieux.forEach((lieu) => {
      const suggestion = document.createElement("li");
      const lieuNom = document.createElement("span");
      const lieuDepartement = document.createElement("span");
      lieuNom.innerHTML = lieu.nom;
      if (nomOuCode == 1) lieuDepartement.innerHTML = `${lieu.codesPostaux[0]}`;
      else lieuDepartement.innerHTML = `${lieu.code}`;

      suggestion.append(lieuNom, lieuDepartement);
      suggestion.addEventListener("click", async (e) => {
        if (tags2.length == 0)
          document.getElementsByClassName("tags-place")[0].style.padding =
            "0 0 8px 8px";

        const communeNom = suggestion.querySelector("span").innerText;

        const url = `https://geo.api.gouv.fr/communes?nom=${communeNom}&fields=departement&boost=population&limit=5`;
        const response = await fetch(url);
        const commune = await response.json();
        let tempData = {
          nom: commune[0].nom,
          code: commune[0].code,
        };
        tags2.push(tempData);

        const tagEl = document.createElement("div");
        tagEl.classList.add("tag");
        tagEl.innerHTML = `${
          suggestion.querySelector("span").innerText
        } <i class="fa fa-times-circle" aria-hidden="true"></i>`;
        tagEl.querySelector("i").addEventListener("click", (e) => {
          // Suppression du tag dans le tableau tags2 et dans la div tagsContainer2
          let temp = [];
          let tagText = e.target.parentElement.innerText;

          let tagIndex;

          for (i = 0; i < tags2.length; i++) {
            tagIndex = tags2.indexOf(tagText);
            if (tags2[i].nom != tagText) temp.push(tags2[i]);
          }
          tags2 = temp;
          e.target.parentElement.remove();
          if (tags2.length == 0)
            document.getElementsByClassName("tags-place")[0].style.padding =
              "0";
        });
        input2.value = "";
        suggestions.value = "";
        tagsContainer2.appendChild(tagEl);
        document.getElementById("suggestions").style.display = "none";
      });
      suggestions.appendChild(suggestion);
    });
  });
});
