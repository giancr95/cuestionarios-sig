// ---------------------------------------------------------------------------
// Datos maestros tomados de las hojas DATOS / Hoja2 de los libros originales
// ---------------------------------------------------------------------------
const RESPONSABLES = [
  "Diego Morales",
  "José Perez",
  "Vladimir Castro",
  "Evelyn Ordoñez",
  "Minor Mesén"
];

const AREAS_BPM = ["Empaque", "Pilado", "Frijoles", "Secado"];
const AREAS_DAC = ["Empaque", "Pilado", "Frijoles", "Secado", "Laboratorio"];
const AREAS_EPP = ["Pilado", "Secado", "Mantenimiento", "Frijoles", "Empaque"];

const DIAS_SEMANA = [
  { key: "L", label: "Lunes" },
  { key: "M", label: "Martes" },
  { key: "K", label: "Miércoles" },
  { key: "J", label: "Jueves" },
  { key: "V", label: "Viernes" },
  { key: "S", label: "Sábado" }
];

// Productos / presentaciones del R-PLP-001 (hoja DATOS)
const PRODUCTOS = [
  { codigo: "1",   nombre: "Banda",                 calidad: "N/A" },
  { codigo: "2",   nombre: "INTERGLO 80%",          calidad: "80%" },
  { codigo: "3",   nombre: "INTERGLO 90%",          calidad: "90%" },
  { codigo: "4",   nombre: "INTERGLO 95%",          calidad: "95%" },
  { codigo: "5",   nombre: "QUEBRADO",              calidad: "N/A" },
  { codigo: "23",  nombre: "DP 95% 23 KG",          calidad: "95%" },
  { codigo: "70",  nombre: "LB 99% 46 KG",          calidad: "99%" },
  { codigo: "71",  nombre: "LB 99% 1.8 KG",         calidad: "99%" },
  { codigo: "72",  nombre: "LB 99% 1.8 KG",         calidad: "99%" },
  { codigo: "73",  nombre: "LB 99% 4 KG",           calidad: "99%" },
  { codigo: "76",  nombre: "LB 99% 1 KG",           calidad: "99%" },
  { codigo: "77",  nombre: "LB 99% 23 KG",          calidad: "99%" },
  { codigo: "78",  nombre: "LB 99% 6 KG",           calidad: "99%" },
  { codigo: "101", nombre: "LB 95% 2 KG",           calidad: "95%" },
  { codigo: "102", nombre: "LB 95% 6 KG",           calidad: "95%" },
  { codigo: "103", nombre: "LB 95% 46 KG",          calidad: "95%" },
  { codigo: "104", nombre: "LB 90% 2 KG",           calidad: "90%" },
  { codigo: "106", nombre: "LB 80% 1.8 KG",         calidad: "80%" },
  { codigo: "107", nombre: "LB 80% 2 KG",           calidad: "80%" },
  { codigo: "109", nombre: "LB 80% 10 KG",          calidad: "80%" },
  { codigo: "110", nombre: "LB 80% 23 KG",          calidad: "80%" },
  { codigo: "111", nombre: "LB 80% 46 KG",          calidad: "80%" },
  { codigo: "114", nombre: "LB 95% 1.8 KG",         calidad: "95%" },
  { codigo: "118", nombre: "LB 95% 23 KG",          calidad: "95%" },
  { codigo: "122", nombre: "LB 90% 46 KG",          calidad: "90%" },
  { codigo: "125", nombre: "LB 90% 23 KG",          calidad: "90%" },
  { codigo: "130", nombre: "LB 90% 5 KG",           calidad: "90%" },
  { codigo: "134", nombre: "CNP 95% 2 KG",          calidad: "95%" },
  { codigo: "150", nombre: "DP 91% 1.8 KG",         calidad: "91%" },
  { codigo: "154", nombre: "LB 90% 1.8 KG",         calidad: "90%" },
  { codigo: "156", nombre: "LB 90% 8 KG",           calidad: "90%" },
  { codigo: "175", nombre: "DP 80% 1.8 KG",         calidad: "80%" },
  { codigo: "176", nombre: "DP 80% 10 KG",          calidad: "80%" },
  { codigo: "180", nombre: "DP 80% 46 KG",          calidad: "80%" },
  { codigo: "183", nombre: "DP 90% 1.8 KG",         calidad: "90%" },
  { codigo: "184", nombre: "DP 95% 1.8 KG",         calidad: "95%" },
  { codigo: "186", nombre: "DP 95% 7 KG",           calidad: "95%" },
  { codigo: "192", nombre: "DP 95% 5 KG",           calidad: "95%" },
  { codigo: "199", nombre: "DP 95% 46 KG",          calidad: "95%" },
  { codigo: "200", nombre: "DP 90% 8 KG",           calidad: "90%" },
  { codigo: "202", nombre: "DP 99% 1.8 KG",         calidad: "99%" },
  { codigo: "205", nombre: "DP 99% 4 KG",           calidad: "99%" },
  { codigo: "207", nombre: "DP 98% 46 KG",          calidad: "98%" },
  { codigo: "208", nombre: "DP 90% 46 KG",          calidad: "90%" },
  { codigo: "209", nombre: "DP 90% 1.5 KG",         calidad: "90%" },
  { codigo: "211", nombre: "CAÑERO 80% 1.8 KG",     calidad: "80%" },
  { codigo: "216", nombre: "DP 99% 7 KG",           calidad: "99%" },
  { codigo: "218", nombre: "CAÑERO 90% 1.5 KG",     calidad: "90%" },
  { codigo: "220", nombre: "CAÑERO 90% 5 KG",       calidad: "90%" },
  { codigo: "407", nombre: "LB FIT 99% 1.8 KG",     calidad: "99%" },
  { codigo: "411", nombre: "LB FIT 99% 1 KG",       calidad: "99%" },
  { codigo: "412", nombre: "LB FIT 99% 1.8 KG",     calidad: "99%" },
  { codigo: "511", nombre: "VILMA 90% 1.8 KG",      calidad: "90%" },
  { codigo: "512", nombre: "VILMA 99% 1.8 KG",      calidad: "99%" },
  { codigo: "513", nombre: "VILMA 80% 1.8 KG",      calidad: "80%" },
  { codigo: "515", nombre: "ANGEL 90% 1.8 KG",      calidad: "90%" },
  { codigo: "517", nombre: "ANGEL 99% 1.8 KG",      calidad: "99%" },
  { codigo: "518", nombre: "MTL 80% 1.8 KG",        calidad: "80%" },
  { codigo: "519", nombre: "MTL 91% 1.8 KG",        calidad: "91%" },
  { codigo: "520", nombre: "MTL 99% 1.8 KG",        calidad: "99%" },
  { codigo: "529", nombre: "ML 95% 1.8 KG",         calidad: "95%" },
  { codigo: "530", nombre: "ML 95% 5 KG",           calidad: "95%" },
  { codigo: "531", nombre: "ML 95% 3 KG",           calidad: "95%" },
  { codigo: "532", nombre: "CKP 80% 1.8 KG",        calidad: "80%" },
  { codigo: "534", nombre: "CKP 90% 1.8 KG",        calidad: "90%" },
  { codigo: "535", nombre: "CKP 99% 1.8 KG",        calidad: "99%" },
  { codigo: "536", nombre: "BM 90% 1.8 KG",         calidad: "90%" },
  { codigo: "537", nombre: "BM 95% 1.8 KG",         calidad: "95%" },
  { codigo: "538", nombre: "BM 99% 1.8 KG",         calidad: "99%" },
  { codigo: "539", nombre: "BM 99% 3.8 KG",         calidad: "99%" },
  { codigo: "",    nombre: "ANGEL 80% 1.8 KG",      calidad: "80%" },
  { codigo: "",    nombre: "DP 99% 1.5 KG",         calidad: "99%" }
];

// Los usuarios iniciales se crean en el backend (server/db.js) a partir de las
// variables de entorno SEED_ADMIN_PASSWORD y SEED_OPERATOR_PASSWORD la primera
// vez que arranca el servicio. El frontend ya no conoce credenciales.
