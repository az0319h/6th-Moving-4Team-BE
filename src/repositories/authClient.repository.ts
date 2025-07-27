import { Client } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { SignUpDataLocal, SignUpDataSocial } from "../types";

async function findById(id: Client["id"]) {
  return await prisma.client.findUnique({
    where: { id },
  });
}

async function findByEmailRaw(email: Client["email"]) {
  return await prisma.client.findUnique({
    where: { email },
  });
}

async function findByEmail(email: Client["email"]) {
  const client = await prisma.client.findUnique({
    where: { email },
  });

  if (!client) return null;
  return { ...client, userType: "client" };
}

async function findByPhone(phone: Client["phone"]) {
  if (!phone) return null;
  return await prisma.client.findUnique({
    where: { phone },
  });
}

// ✅ 회원가입 - Local
async function create(user: SignUpDataLocal) {
  const newClient = await prisma.client.create({
    data: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      hashedPassword: user.password,
    },
  });

  return { ...newClient, userType: "client" }; // userType: 헤더에서 씀
}

// ✅ 소셜 로그인
async function save(user: SignUpDataSocial) {
  const newClient = await prisma.client.create({
    data: {
      name: user.name,
      email: user.email!,
      phone: user.phone,
      provider: user.provider,
      providerId: user.providerId,
    },
  });

  return { ...newClient, userType: "client" }; // userType: 헤더에서 씀
}

async function update(id: string, data: Omit<SignUpDataSocial, "email">) {
  const newClient = await prisma.client.update({
    where: { id },
    data: data,
  });

  return { ...newClient, userType: "client" };
}

async function createOrUpdate({ provider, providerId, email, name, phone }: SignUpDataSocial) {
  const newClient = prisma.client.upsert({
    where: { provider_providerId: { provider, providerId } },
    update: { email, name },
    create: { provider, providerId, email, name, phone },
  });

  return { ...newClient, userType: "client" };
}

const authClientRepository = {
  findById,
  findByEmailRaw,
  findByEmail,
  findByPhone,
  create,
  update,
  save,
  createOrUpdate,
};

export default authClientRepository;
