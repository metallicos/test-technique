<?php

namespace App\DataFixtures;

use App\Document\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Faker\Factory;

class UserFixtures extends Fixture
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher
    ) {}

    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create();
        
        // Create 2 admin users
        for ($i = 1; $i <= 2; $i++) {
            $user = new User();
            $user->setEmail("admin{$i}@example.com");
            $user->setName($faker->name());
            $user->setRoles(['ROLE_ADMIN']);
            
            $hashedPassword = $this->passwordHasher->hashPassword(
                $user,
                "123456" 
            );
            $user->setPassword($hashedPassword);
            
            $manager->persist($user);
            $this->addReference('admin-'.$i, $user);
        }

        // Create 5 regular users
        for ($i = 1; $i <= 5; $i++) {
            $user = new User();
            $user->setEmail($faker->unique()->safeEmail());
            $user->setName($faker->name());
            $user->setRoles(['ROLE_USER']);
            
            $hashedPassword = $this->passwordHasher->hashPassword(
                $user,
                "123456" 
            );
            $user->setPassword($hashedPassword);
            
            $manager->persist($user);
            $this->addReference('user-'.$i, $user);
        }

        $manager->flush();
    }
}