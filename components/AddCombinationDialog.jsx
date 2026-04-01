import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // ✅ Added Tooltip
import {
  PlusCircle,
  Search,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";

const API_BASE = "http://46.225.154.106:8000";

// ✅ Growth Stage Translation Map (Expand this as needed)
const STAGE_MAP = {
  AMA: "Abgefallene Blütenkäppchen",
  AMK: "Abgehende Blüte",
  LWF: "Laubwandfläche (Basis für Dosierung)",
  ES: "Entwicklungsstadium",
  VB: "Vorblüte",
  NB: "Nachblüte",
};

export default function AddCombinationDialog({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [diseaseSearch, setDiseaseSearch] = useState("");
  const [diseases, setDiseases] = useState([]);
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [permittedOptions, setPermittedOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setDiseaseSearch("");
      setDiseases([]);
      setSelectedDisease(null);
      setProductSearch("");
      setProducts([]);
      setSelectedProduct(null);
      setPermittedOptions([]);
      setSelectedOption(null);
    }
  }, [open]);

  // Search logic for Diseases
  useEffect(() => {
    if (diseaseSearch.length < 3) {
      setDiseases([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/search/disease?q=${diseaseSearch}`,
        );
        const data = await res.json();
        setDiseases(
          Array.isArray(data) ? data.filter((item) => item !== null) : [],
        );
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [diseaseSearch]);

  // Search logic for Products
  useEffect(() => {
    if (productSearch.length < 3) {
      setProducts([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/search/product?q=${productSearch}`,
        );
        const data = await res.json();
        setProducts(
          Array.isArray(data) ? data.filter((item) => item !== null) : [],
        );
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [productSearch]);

  const fetchPermittedOptions = async (prodId, disCode) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/calculate/permitted-spray?product_id=${prodId}&disease_code=${disCode}`,
      );
      if (res.ok) {
        const data = await res.json();
        setPermittedOptions(data);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleConfirm = () => {
    if (!selectedOption) return;
    onAdd({
      productName: selectedProduct.mittelname,
      diseaseName: selectedDisease.kodetext,
      amount: selectedOption.amount,
      unit: selectedOption.unit,
      es_stage: selectedOption.es_stage,
      awgId: selectedOption.awg_id,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          className="w-full border-2 border-dashed border-slate-200 py-8 hover:bg-slate-100"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Kombination hinzufügen
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[550px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Anwendung konfigurieren</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-grow pr-4">
          <div className="space-y-6 py-4">
            {/* 1. DISEASE SEARCH */}
            <div className="space-y-2 relative">
              <Label>1. Krankheit</Label>
              {selectedDisease ? (
                <div className="flex justify-between p-2 bg-green-50 border border-green-200 rounded text-sm items-center">
                  <span className="font-medium text-green-800">
                    {selectedDisease.kodetext}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDisease(null)}
                  >
                    Ändern
                  </Button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Suchen..."
                      className="pl-8"
                      value={diseaseSearch}
                      onChange={(e) => setDiseaseSearch(e.target.value)}
                    />
                  </div>
                  {diseases.length > 0 && (
                    <div className="z-50 w-full mt-1 bg-white border rounded-md shadow-xl max-h-40 overflow-y-auto">
                      {diseases.map((d, i) => (
                        <div
                          key={i}
                          className="p-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-0"
                          onClick={() => setSelectedDisease(d)}
                        >
                          {d.kodetext}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 2. PRODUCT SEARCH */}
            {selectedDisease && (
              <div className="space-y-2 relative">
                <Label>2. Pflanzenschutzmittel</Label>
                {selectedProduct ? (
                  <div className="flex justify-between p-2 bg-blue-50 border border-blue-200 rounded text-sm items-center">
                    <span className="font-medium text-blue-800">
                      {selectedProduct.mittelname}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedProduct(null)}
                    >
                      Ändern
                    </Button>
                  </div>
                ) : (
                  <>
                    <Input
                      placeholder="Suchen..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                    {products.length > 0 && (
                      <div className="z-50 w-full mt-1 bg-white border rounded-md shadow-xl max-h-40 overflow-y-auto">
                        {products.map((p, i) => (
                          <div
                            key={i}
                            className="p-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-0"
                            onClick={() => {
                              setSelectedProduct(p);
                              fetchPermittedOptions(
                                p.kennr,
                                selectedDisease.kode,
                              );
                            }}
                          >
                            {p.mittelname}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* 3. OPTIONS WITH TOOLTIP */}
            <TooltipProvider>
              {permittedOptions.length > 0 && (
                <div className="space-y-3">
                  <Label>3. Zulässige Anwendung wählen</Label>
                  <ScrollArea className="h-72 w-full rounded-md border p-2">
                    <div className="grid gap-2">
                      {permittedOptions.map((opt, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedOption(opt)}
                          className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                            selectedOption === opt
                              ? "border-blue-600 bg-blue-50"
                              : "border-slate-100 bg-white hover:border-slate-200"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-lg font-bold">
                                {opt.amount}{" "}
                                <span className="text-sm font-normal">
                                  {opt.unit}
                                </span>
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono italic">
                                {opt.awg_id}
                              </p>
                            </div>

                            {/* ✅ TOOLTIP LOGIC HERE */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-1 bg-slate-900 text-white px-2 py-1 rounded cursor-help">
                                  <span className="text-xs font-bold">
                                    {opt.es_stage}
                                  </span>
                                  <Info className="h-3 w-3 opacity-50" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">
                                  {STAGE_MAP[opt.es_stage] ||
                                    "BVL Wachstumsstadium Code"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </TooltipProvider>

            {loading && (
              <div className="text-center py-4 animate-pulse text-slate-400">
                Suche Optionen...
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t">
          <Button
            disabled={!selectedOption || loading}
            onClick={handleConfirm}
            className="w-full bg-blue-700"
          >
            Hinzufügen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
