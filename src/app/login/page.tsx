"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Logo from "@/assets/Logo.png";
import { useAuth } from "@/context/AuthContext";

import { loginSchema } from "./schema";

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormValues) => {
    console.log("Login data:", data);

    // TODO
    /**
     * o auth está salvando o email temporariamente, a ideia é enviar para o back email/senha
     * receber um token e salvar
     */
    login({ email: data.email }, "tempToken");
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <Card className="w-full max-w-sm shadow-md">
        <div className="flex justify-center mb-4 h-[220px] rounded-lg">
          <Image
            src={Logo}
            alt="Logo"
            className="w-full h-auto object-cover rounded-t-lg"
          />
        </div>
        <CardHeader>
          <h1 className="text-xl font-semibold text-center">Login</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Insira seu email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="Insira sua senha"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full">
              Confirmar
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Esqueceu a senha?{" "}
            <a
              href="/forgot-password"
              className="text-blue-600 hover:underline"
            >
              Recupere sua senha
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
