import { Client } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { SignUpDataLocal } from "../types";

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
    include: {
      livingArea: { select: { regionName: true } },
    },
  });

  const livingArea = client?.livingArea.map((area) => area.regionName);

  if (!client) return null;
  return { ...client, userType: "client", livingArea };
}

async function findByPhone(phone: Client["phone"]) {
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
      hashedPassword: user.hashedPassword!,
    },

    include: {
      livingArea: { select: { regionName: true } },
    },
  });

  const livingArea = newClient?.livingArea.map((area) => area.regionName);

  return { ...newClient, userType: "client", livingArea }; // userType: 헤더에서 씀
}

const authClientRepository = {
  findById,
  findByEmailRaw,
  findByEmail,
  findByPhone,
  create,
};

export default authClientRepository;
