<?php
namespace App\Repository;

use App\Document\Article;
use Doctrine\Bundle\MongoDBBundle\ManagerRegistry; 
use Doctrine\Bundle\MongoDBBundle\Repository\ServiceDocumentRepository;

class ArticleRepository extends ServiceDocumentRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Article::class);
    }

    public function paginate(int $page = 1, int $limit = 10): array
    {
        $query = $this->createQueryBuilder()
            ->skip(($page - 1) * $limit)
            ->limit($limit)
            ->getQuery();

        $total = $this->dm->createQueryBuilder(Article::class)->count()->getQuery()->execute();

        return [
            'results' => $query->execute()->toArray(),
            'total' => $total,
            'page' => $page,
            'limit' => $limit,
            'pages' => ceil($total / $limit),
        ];
    }
    
    public function findArticlesByUser($user, int $page = 1, int $limit = 5): array
    {
        $offset = ($page - 1) * $limit;

        // Query builder for the paginated results
        $qb = $this->dm->createQueryBuilder(Article::class)
            ->field('author')->equals($user)
            ->sort('publicationDate', 'desc')
            ->skip($offset)
            ->limit($limit);

        $results = $qb->getQuery()->execute()->toArray();

        // Count total items (without skip/limit)
        $countQb = $this->dm->createQueryBuilder(Article::class)
        ->field('author')->equals($user)
        ->count();
    
        $totalItems = $countQb->getQuery()->execute();
        $totalPages = (int) ceil($totalItems / $limit);

        return [
            'results'     => $results,
            'total_items' => $totalItems,
            'total_pages' => $totalPages,
        ];
    }
    



}