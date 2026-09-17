/**
 * De vier schermen van de doorloop, en verder niets.
 *
 * Dit is geen halve website maar één route die bewezen moet worden:
 * je zegt wat je vervoert en je komt ergens uit waar je verder kunt.
 * Vandaar vier bestemmingen en geen menu vol pagina's die niet bestaan.
 */

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Balk } from "./onderdelen/Balk";
import { Voet } from "./onderdelen/Voet";
import { BranchePagina } from "./paginas/BranchePagina";
import { CategoriePagina } from "./paginas/CategoriePagina";
import { OffertePagina } from "./paginas/OffertePagina";
import { ProductPagina } from "./paginas/ProductPagina";
import { ZoekPagina } from "./paginas/ZoekPagina";

export function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <Balk />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate replace to="/case-voor" />} />
            <Route path="/case-voor" element={<ZoekPagina />} />
            <Route path="/categorie" element={<CategoriePagina />} />
            <Route path="/product" element={<ProductPagina />} />
            <Route path="/branche/:naam" element={<BranchePagina />} />
            <Route path="/offerte" element={<OffertePagina />} />
            <Route path="*" element={<Navigate replace to="/case-voor" />} />
          </Routes>
        </main>
        <Voet />
      </div>
    </BrowserRouter>
  );
}
