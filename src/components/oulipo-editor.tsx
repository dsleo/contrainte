"use client";

import { useState, useEffect, useMemo } from 'react';
import { Type, AlertCircle } from 'lucide-react';
import { CONSTRAINTS, type Constraint } from '@/lib/constraints';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type ConstraintId = (typeof CONSTRAINTS)[number]['id'] | 'none';

export default function OulipoEditor() {
  const [constraintId, setConstraintId] = useState<ConstraintId>('none');
  const [param, setParam] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const selectedConstraint = useMemo(() => 
    CONSTRAINTS.find(c => c.id === constraintId),
    [constraintId]
  );

  useEffect(() => {
    setText('');
    setParam('');
    setError(null);
  }, [constraintId]);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;

    if (selectedConstraint && param) {
      const { isValid, error: validationError } = selectedConstraint.validate(newText, param);
      if (isValid) {
        setText(newText);
        if (error) setError(null);
      } else {
        setError(validationError || 'Contrainte violée.');
      }
    } else {
      setText(newText);
    }
  };

  const handleConstraintChange = (id: ConstraintId) => {
    setConstraintId(id);
  }

  const handleParamChange = (newParam: string) => {
    setParam(newParam);
    setText('');
    setError(null);
  }

  const canWrite = (constraintId !== 'none' && param !== '') || constraintId === 'none';

  if (!isClient) {
    return null; // or a loading skeleton
  }

  return (
    <div className="w-full max-w-3xl space-y-6">
      <header className="text-center space-y-2">
        <div className="flex justify-center items-center gap-4 text-primary">
          <Type className="w-10 h-10" />
          <h1 className="text-4xl font-bold">La Contrainte</h1>
        </div>
        <p className="text-muted-foreground">L'art d'écrire sous contrainte.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>1. Choisissez une contrainte</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={constraintId} onValueChange={handleConstraintChange} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CONSTRAINTS.map((constraint) => (
              <Label key={constraint.id} htmlFor={constraint.id} className="flex flex-col items-start gap-2 rounded-md border p-4 hover:bg-accent/50 hover:text-accent-foreground [&:has([data-state=checked])]:border-primary">
                 <div className="flex items-center gap-2">
                  <RadioGroupItem value={constraint.id} id={constraint.id} />
                  <span className="font-bold">{constraint.name}</span>
                 </div>
                <span className="text-sm text-muted-foreground pl-6">{constraint.description}</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {selectedConstraint && (
        <div className="animate-in fade-in-50 duration-500">
          <Card>
            <CardHeader>
              <CardTitle>2. Définissez le paramètre</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Label htmlFor="param-select">{selectedConstraint.parameter.label}</Label>
                <Select value={param} onValueChange={handleParamChange}>
                  <SelectTrigger id="param-select" className="w-full md:w-[180px]">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedConstraint.parameter.options.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>3. Écrivez</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={text}
            onChange={handleTextChange}
            disabled={!canWrite}
            placeholder={
              canWrite 
                ? "Commencez à taper..." 
                : "Veuillez sélectionner une contrainte et un paramètre."
            }
            className="typewriter-textarea"
            rows={10}
          />
        </CardContent>
      </Card>
      
      {error && (
        <div className="animate-in fade-in-50 duration-500">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur de contrainte</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
