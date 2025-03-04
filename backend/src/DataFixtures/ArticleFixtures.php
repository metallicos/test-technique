<?php
namespace App\DataFixtures;

use App\Document\Article;
use App\Document\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;
use Faker\Factory;

class ArticleFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        $faker = Factory::create();

        // Create articles for all users (admins + regular users)
        for ($userId = 1; $userId <= 2; $userId++) { // Admins
            /** @var User $author */
            $author = $this->getReference('admin-'.$userId, User::class);
            $this->createArticlesForUser($manager, $faker, $author, 10);
        }

        for ($userId = 1; $userId <= 5; $userId++) { // Regular users
            /** @var User $author */
            $author = $this->getReference('user-'.$userId, User::class);
            $this->createArticlesForUser($manager, $faker, $author, 10);
        }

        $manager->flush();
    }

    private function createArticlesForUser(
        ObjectManager $manager, 
        \Faker\Generator $faker,
        User $author,
        int $count
    ): void {
        for ($i = 0; $i < $count; $i++) {
            $article = new Article();
            $article->setTitle($faker->sentence(6));
            $article->setContent($faker->paragraphs(3, true));
            $article->setAuthor($author);
            $article->setPublicationDate($faker->dateTimeBetween('-1 month', 'now'));
            
            $manager->persist($article);
        }
    }

    public function getDependencies(): array
    {
        return [
            UserFixtures::class
        ];
    }
}