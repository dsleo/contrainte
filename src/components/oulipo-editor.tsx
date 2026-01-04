
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { Type, AlertCircle } from 'lucide-react';
import { CONSTRAINTS, type Constraint } from '@/lib/constraints';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from '@/lib/utils';

type ConstraintId = (typeof CONSTRAINTS)[number]['id'] | 'none';

export default function OulipoEditor() {
  const [constraintId, setConstraintId] = useState<ConstraintId>('none');
  const [param, setParam] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  const paramCardRef = useRef<HTMLDivElement>(null);
  const editorCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const selectedConstraint = useMemo(() => 
    CONSTRAINTS.find(c => c.id === constraintId),
    [constraintId]
  );

  // Scroll to param card when a constraint is selected
  useEffect(() => {
    if (selectedConstraint && paramCardRef.current) {
      paramCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedConstraint]);

  // Scroll to editor card when param is selected
  useEffect(() => {
    if (param && editorCardRef.current) {
      editorCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [param]);

  const validateAndSetText = (currentText: string) => {
    if (selectedConstraint && param) {
      const { isValid, error: validationError } = selectedConstraint.validate(currentText, param);
      setError(isValid ? null : validationError || 'Erreur de contrainte');
    } else {
      setError(null);
    }
    setText(currentText);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    validateAndSetText(newText);
  };

  const handleConstraintChange = (id: ConstraintId) => {
    setConstraintId(id);
    setParam('');
    setText('');
    setError(null);
  }

  const handleParamChange = (newParam: string) => {
    setParam(newParam);
    validateAndSetText(text);
  }

  const showParamCard = !!selectedConstraint;
  const showEditorCard = showParamCard && !!param;

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
      </header>

      <Card>
        <CardHeader>
          <CardTitle>1. Choisissez une contrainte</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={constraintId} onValueChange={handleConstraintChange} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CONSTRAINTS.map((constraint) => (
              <Label key={constraint.id} htmlFor={constraint.id} className="flex flex-col items-start gap-2 rounded-md border p-4 hover:bg-accent/50 hover:text-accent-foreground [&:has([data-state=checked])]:border-primary cursor-pointer">
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

      {showParamCard && selectedConstraint && (
        <div ref={paramCardRef} className="animate-in fade-in-50 duration-500">
          <Card>
            <CardHeader>
              <CardTitle>2. {selectedConstraint.parameter.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
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

      {showEditorCard && (
        <div ref={editorCardRef} className="animate-in fade-in-50 duration-500">
          <Card>
            <CardHeader>
              <CardTitle>3. Écrivez</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={text}
                onChange={handleTextChange}
                placeholder="Commencez à taper..."
                className={cn(
                  "typewriter-textarea",
                  error && "border-destructive focus-visible:ring-destructive"
                )}
                rows={10}
              />
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )}
      
    </div>
  );
}
