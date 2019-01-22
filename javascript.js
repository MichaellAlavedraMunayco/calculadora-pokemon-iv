"use strict";
var c = 1;

function change_gif(img) {
  var pkname = document.getElementById("poke-name");
  var url = "http://www.pokestadium.com/sprites/xy/";
  switch (c) {
    case 2:
      url += pkname.innerText.toLowerCase() + "-2.gif";
      break;
    case 3:
      url += pkname.innerText.toLowerCase() + "-3.gif";
      break;
    case 4:
      url += "back/" + pkname.innerText.toLowerCase() + ".gif";
      break;
    case 5:
      url += "shiny/" + pkname.innerText.toLowerCase() + ".gif";
      break;
    default:
      url += pkname.innerText.toLowerCase() + ".gif";
      break;
  }
  img.src = url;
  if (c > 5) c = 1;
  c++;
}

function select_attribute(div_elem) {
  div_elem.children[0].checked = true;
  var array_divs = document.getElementsByName("rad");
  for (var i = 0; i < array_divs.length; i++) {
    array_divs[i].setAttribute("class", "sel");
  }
  div_elem.setAttribute("class", "sel2");
}

function search_pokemon(h_elem) {
  var img = document.getElementById("img-pk");
  img.src = "http://www.pokestadium.com/sprites/xy/" + h_elem.innerText.toLowerCase() + ".gif";
  c = 1;
}

function calcular() {
  const pokemon = document.getElementById("poke-name").innerText;
  const puntos_combate = document.getElementById("poke-cp").innerText;
  const puntos_salud = document.getElementById("poke-hp").innerText;
  const costo_polvo = document.getElementById("poke-stardust").innerText;
  // console.log(pokemon, puntos_combate, puntos_salud, costo_polvo);
  var nivel_base = BD.costo_polvos.find((val) => {
    return val.polvos == costo_polvo;
  });
  const pok = BD.valores_base.find((val) => {
    return val.nombre.toLowerCase() == pokemon.toLowerCase();
  });
  if (!pokemon || isNaN(puntos_combate) || isNaN(puntos_salud) || isNaN(costo_polvo) || !nivel_base || !pok) {
    alert("There was an error regarding the input data, make sure you entered the correct data.");
    return;
  }
  nivel_base = parseInt(BD.costo_polvos.find((val) => {
    return val.polvos == costo_polvo;
  }).rango_nivel.split("-")[0]);
  const id_pok = parseInt(pok.id);
  const res_base = parseInt(pok.resistencia_base);
  const ata_base = parseInt(pok.ataque_base);
  const def_base = parseInt(pok.defensa_base);

  var mults = [];
  for (var j = 0; j < BD.multiplicadores.length; j++) {
    if (mults.length > 5) break;
    if (BD.multiplicadores[j].nivel == nivel_base) {
      mults.push(BD.multiplicadores[j].multiplicador);
      nivel_base += 0.5;
    }
  }
  // console.log(mults);
  var tabla_HP = [];
  for (var i = 0; i < 15; i++) {
    tabla_HP[i] = [];
    for (var j = 0; j < 5; j++) {
      tabla_HP[i].push(Math.round((res_base + (i + 1)) * mults[j]));
    }
    tabla_HP[i].push((i + 1));
  }
  // console.log(tabla_HP);
  var result_HP = [];
  for (var i = 0; i < tabla_HP.length; i++) {
    if (tabla_HP[i].some((val) => {
        return val == puntos_salud;
      })) {
      result_HP.push(tabla_HP[i][tabla_HP[i].length - 1]);
    }
  }
  // console.log(result_HP);
  var tabla_completa = [];
  var c = 0;
  for (var ataqueiv = 0; ataqueiv < 15; ataqueiv++) {
    for (var defensaiv = 0; defensaiv < 15; defensaiv++) {
      for (var resistenciaiv = 0; resistenciaiv < 15; resistenciaiv++) {
        if (!result_HP.includes(resistenciaiv + 1)) continue;
        tabla_completa[c] = [];
        for (var ind = 0; ind < 5; ind++) {
          var CP = ((ata_base + ataqueiv + 1) *
            Math.sqrt(def_base + defensaiv + 1) *
            Math.sqrt(res_base + resistenciaiv + 1) *
            Math.pow(mults[ind], 2)) / 10;
          tabla_completa[c].push(Math.floor(CP));
        }
        tabla_completa[c].push((ataqueiv + 1), (defensaiv + 1), (resistenciaiv + 1));
        c++;
      }
    }
  }
  var result_CP = [],
    ind = 0;
  for (var i = 0; i < tabla_completa.length; i++) {
    if (tabla_completa[i].some((val) => {
        return val == puntos_combate;
      })) {
      result_CP[ind] = [];
      var ata = tabla_completa[i][tabla_completa[i].length - 3],
        def = tabla_completa[i][tabla_completa[i].length - 2],
        res = tabla_completa[i][tabla_completa[i].length - 1];
      result_CP[ind++].push(ata, def, res,
        Math.floor((ata + def + res) / 45 * 100));
    }
  }
  var array_radios = document.getElementsByName("attribute");
  var pos = (array_radios[0].checked) ? 0 : (array_radios[1].checked) ? 1 : 2;
  result_CP = result_CP.sort((a, b) => {
    return b[pos] - a[pos]
  });
  // console.log(result_CP);
  var maxatriv = result_CP[0][pos];
  result_CP = result_CP.filter((val) => {
    return val[pos] == maxatriv
  });
  result_CP = result_CP.sort((a, b) => {
    return b[3] - a[3]
  });

  var outputs = document.getElementsByName("output");
  outputs[0].innerText = result_CP[0][3] + "%";
  outputs[1].innerText = result_CP[0][1];
  outputs[2].innerText = result_CP[0][2];
  outputs[3].innerText = result_CP[0][0];
}