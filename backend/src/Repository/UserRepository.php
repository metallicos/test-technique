<?php

namespace App\Repository;

use App\Document\User;
use Doctrine\Bundle\MongoDBBundle\ManagerRegistry; 
use Doctrine\Bundle\MongoDBBundle\Repository\ServiceDocumentRepository;

class UserRepository extends ServiceDocumentRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    public function emailExists(string $email, ?string $excludeUserId = null): bool
    {
        $qb = $this->createQueryBuilder()
            ->field('email')->equals($email);
    
        if ($excludeUserId) {
            $qb->field('id')->notEqual($excludeUserId);
        }
    
        return $qb->count()->getQuery()->execute() > 0;
    }
}