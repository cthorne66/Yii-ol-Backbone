<?php
class PostController extends Controller
{
	public function accessRules()
	{
		return array_merge(
			array(array('allow',
				'actions' => array('read', 'list', 'comments'),
				'users' => array('?')
			)),
			parent::accessRules()
		);
	}

	public function actionRead($id)
	{
		if (null === ($model = Post::model()->findByPk($id)))
			throw new CHttpException(404);
		$this->sendResponse(200, CJSON::encode($model));
	}

  public function actionReadWithComments($id)
  {
    if (null === ($model = Post::model()->with('comments')->findByPk($id)))
      throw new CHttpException(404);
    $post = $model->getAttributes();
    $commentArray = $model->getRelated('comments');
    $comments = array();
    foreach($commentArray as $comment){
      $comments[] = $comment->getAttributes();
    }
    $post['comments'] = $comments;
    $this->sendResponse(200, CJSON::encode($post));
  }

	public function actionList()
	{
		$models = Post::model()->findAll();
		$this->sendResponse(200, CJSON::encode($models));
	}

  public function actionListWithComments()
  {
    $models = Post::model()->with('comments')->findAll();
    $posts = Array();
    foreach($models as $model){
      $post = $model->getAttributes();
      $comments = array();
      foreach($model->getRelated('comments') as $comment){
        $comments[] = $comment->getAttributes();
      }
      $post['comments'] = $comments;
      $post['comments'];
      $posts[] = $post;
      //$posts[] = array('jsonDataSource'=>array('attributes'=>$attributes,'relations'=>$this->relations));
    }
    $this->sendResponse(200, CJSON::encode($posts));
  }

	public function actionCreate()
	{
		$model = new Post();
		$model->setAttributes($this->getJsonInput());
		if (!$model->validate()) {
			$this->sendResponse(400, CHtml::errorSummary($model));
		} else if (!$model->save(false)) {
			throw new CException('Cannot create a record');
		}
		$model->refresh();
		$this->sendResponse(200, CJSON::encode($model));
	}

	public function actionUpdate($id)
	{
		if (null === ($model = Post::model()->findByPk($id)))
			throw new CHttpException(404);
		$model->setAttributes($this->getJsonInput());
		if (!$model->validate()) {
			$this->sendResponse(400, CHtml::errorSummary($model));
		} else if (!$model->save(false)) {
			throw new CException('Cannot update a record');
		}
		$model->refresh();
		$this->sendResponse(200, CJSON::encode($model));
	}

	public function actionDelete($id)
	{
		if (null === ($model = Post::model()->findByPk($id)))
			throw new CHttpException(404);
		if (!$model->delete())
			throw new CException('Cannot delete post');
	}

	public function actionComments($id)
	{
		if (null === ($model = Post::model()->findByPk($id)))
			throw new CHttpException(404);
		$this->sendResponse(200, CJSON::encode($model->comments));
	}
}
