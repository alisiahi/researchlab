import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function GeneralInfo({ data, onChange }) {
  const handleChange = (e) => {
    onChange({ ...data, [e.target.name]: e.target.value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-1.5">
        <Label htmlFor="spritzgemeinschaft">Spritzgemeinschaft / Dritte</Label>
        <Input
          id="spritzgemeinschaft"
          name="spritzgemeinschaft"
          value={data.spritzgemeinschaft}
          onChange={handleChange}
          placeholder="Name des Betriebs"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ansprechpartner">Ansprechpartner</Label>
        <Input
          id="ansprechpartner"
          name="ansprechpartner"
          value={data.ansprechpartner}
          onChange={handleChange}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="tel">Telefon</Label>
        <Input id="tel" name="tel" value={data.tel} onChange={handleChange} />
      </div>
    </div>
  );
}
