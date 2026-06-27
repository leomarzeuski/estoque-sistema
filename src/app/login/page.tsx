"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Logo from "@/assets/Logo.png";
import { useAuth } from "@/context/AuthContext";

const Login: React.FC = () => {
  const { login } = useAuth();
  const router = useRouter();
  const [nome, setNome] = useState("");

  const entrar = (e: React.FormEvent) => {
    e.preventDefault();
    login({ nome: nome.trim() || undefined }, "tempToken");
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-sm p-6 shadow-md">
        <div className="mb-4 flex justify-center">
          <Image
            src={Logo}
            alt="Meu Estoque"
            className="h-28 w-auto object-contain"
            priority
          />
        </div>
        <h1 className="text-center text-2xl font-bold text-gray-900">
          Meu Estoque
        </h1>
        <p className="mt-1 text-center text-sm text-gray-500">
          Controle simples do seu estoque
        </p>

        <form onSubmit={entrar} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="nome" className="mb-1 block text-base">
              Seu nome <span className="text-gray-400">(opcional)</span>
            </Label>
            <Input
              id="nome"
              className="h-12"
              placeholder="Ex: João"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
            />
          </div>
          <Button type="submit" className="h-12 w-full text-base">
            Entrar
          </Button>
        </form>
      </Card>
      <p className="mt-4 max-w-xs text-center text-xs text-gray-400">
        Seus dados ficam guardados só neste aparelho.
      </p>
    </div>
  );
};

export default Login;
